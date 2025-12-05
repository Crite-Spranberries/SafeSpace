import * as FileSystem from 'expo-file-system/legacy';
import { RetrieveResponse } from 'roughlyai';
import { Asset } from 'expo-asset';
import {
  ReportData,
  createEmptyReportData,
  mergeReportData,
  createReportDataFromDate,
  WORKSAFEBC_VIOLATION_TYPES,
  TRADE_FIELDS,
  validateReportTypes,
  validateTradeFields,
} from './reportData';

const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

/**
 * Reads the report format template from assets
 * Tries multiple methods to load the template file
 */
const loadReportTemplate = async (): Promise<string> => {
  try {
    // Method 1: Try using Asset.fromModule (works if Metro is configured for .txt files)
    try {
      const asset = Asset.fromModule(require('@/assets/data/report_format.txt'));
      await asset.downloadAsync();

      if (asset.localUri) {
        const templateContent = await FileSystem.readAsStringAsync(asset.localUri);
        if (templateContent.trim()) {
          return templateContent.trim();
        }
      }
    } catch (assetErr) {
      // Method 2: Try direct require (if Metro handles .txt files)
      try {
        const templateModule = require('@/assets/data/report_format.txt');
        if (typeof templateModule === 'string') {
          return templateModule.trim();
        }
        if (templateModule?.default && typeof templateModule.default === 'string') {
          return templateModule.default.trim();
        }
      } catch (requireErr) {
        console.warn('Could not load template via require:', requireErr);
      }
    }

    console.warn('Report template could not be loaded, using empty template');
    return '';
  } catch (err) {
    console.warn('Failed to load report template:', err);
    return '';
  }
};

export const transcribeAudio = async (uri: string) => {
  if (!apiKey) {
    console.warn('OpenAI API key is missing');
    return undefined;
  }

  try {
    const response = await FileSystem.uploadAsync(
      'https://api.openai.com/v1/audio/transcriptions',
      uri,
      {
        headers: { Authorization: `Bearer ${apiKey}` },
        httpMethod: 'POST',
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        fieldName: 'file',
        mimeType: 'audio/m4a',
        parameters: { model: 'gpt-4o-mini-transcribe' },
      }
    );

    console.log('Transcription response status:', response.status);
    const json = JSON.parse(response.body);
    console.log('Transcription text:', json.text ? 'Found' : 'Missing');
    return json.text;
  } catch (err) {
    console.error('Transcription Error', err);
    return undefined;
  }
};

/**
 * Parses AI-generated report text into structured ReportData
 * Attempts to extract JSON from the response, falls back to text parsing
 */
const parseReportResponse = (
  responseText: string,
  baseData: Partial<ReportData>
): Partial<ReportData> => {
  try {
    // Try to extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      // Validate and merge with base data
      const parsedReportTypes = Array.isArray(parsed.report_type)
        ? parsed.report_type
        : baseData.report_type || [];
      const parsedTradeFields = Array.isArray(parsed.trades_field)
        ? parsed.trades_field
        : baseData.trades_field || [];

      return {
        ...baseData,
        report_title: parsed.report_title || baseData.report_title || '',
        report_type: validateReportTypes(parsedReportTypes),
        trades_field: validateTradeFields(parsedTradeFields),
        report_desc:
          parsed.report_desc || parsed.report_description || parsed.description || responseText,
        primaries_involved: Array.isArray(parsed.primaries_involved)
          ? parsed.primaries_involved
          : baseData.primaries_involved || [],
        witnesses: Array.isArray(parsed.witnesses) ? parsed.witnesses : baseData.witnesses || [],
        actions_taken: Array.isArray(parsed.actions_taken)
          ? parsed.actions_taken
          : baseData.actions_taken || [],
        recommended_actions: Array.isArray(parsed.recommended_actions)
          ? parsed.recommended_actions.slice(0, 7) // Hard cap at 7
          : Array.isArray(baseData.recommended_actions)
            ? baseData.recommended_actions.slice(0, 7)
            : [],
        location_name: parsed.location_name || parsed.location || baseData.location_name || '',
      };
    }
  } catch (parseErr) {
    console.warn('Failed to parse JSON from response', parseErr);
  }

  // Fallback: use the text as description
  return {
    ...baseData,
    report_desc: responseText,
  };
};

/**
 * Generates a structured report from transcript
 * Returns both raw text and structured data
 */
export const generateReport = async (
  transcript: string,
  metadata?: {
    audioUri?: string;
    date?: Date;
    location?: { name?: string; coords?: [number, number] };
  }
): Promise<{ text: string; data: Partial<ReportData> } | undefined> => {
  try {
    // Validate transcript
    if (!transcript || transcript.trim().length === 0) {
      console.error('GenerateReport: Empty transcript provided');
      return undefined;
    }

    console.log('GenerateReport: Transcript length:', transcript.length);
    console.log('GenerateReport: Transcript preview:', transcript.substring(0, 200));

    // Load the local report template
    const templateContent = await loadReportTemplate();

    // Create base data from metadata
    const baseData: Partial<ReportData> = metadata?.date
      ? createReportDataFromDate(metadata.date, metadata.audioUri)
      : { audio_URI: metadata?.audioUri || '' };

    if (metadata?.location) {
      baseData.location_name = metadata.location.name || '';
      baseData.location_coords = metadata.location.coords || [0, 0];
    }

    // Build the prompt requesting structured JSON output
    const templateSection = templateContent
      ? `Use the following template format:\n\n${templateContent}\n\n`
      : '';

    const prompt = `${templateSection}You are analyzing a workplace incident recording transcript. Your task is to extract ALL relevant information from the transcript and create a structured incident report.

CRITICAL: You MUST extract information directly from the transcript provided below. Do not make up information that is not in the transcript. Analyze the actual words, events, and details mentioned in the transcript.

Create a structured incident report in JSON format matching this structure:
{
  "report_title": "Short, concise title (max 6-8 words) - brief general description of the situation",
  "report_type": ["array of incident types - MUST be from the valid list below"],
  "trades_field": ["array of trade fields - MUST be from the valid list below"],
  "report_desc": "Professional, comprehensive description including: factual account of events, unbiased description of emotional tone/context/atmosphere observed, and how these factors may have impacted the situation",
  "primaries_involved": ["array of people involved as mentioned in the transcript"],
  "witnesses": ["array of witness names if mentioned in the transcript"],
  "actions_taken": ["array of actions already taken as described in the transcript"],
  "recommended_actions": ["array of recommended next steps based on the incident described"],
  "location_name": "location if mentioned in the transcript"
}

VALID REPORT TYPES (worksafebcViolationTypes) - You MUST ONLY use values from this list:
${WORKSAFEBC_VIOLATION_TYPES.map((type) => `- ${type}`).join('\n')}

VALID TRADE FIELDS (tradeFields) - You MUST ONLY use values from this list:
${TRADE_FIELDS.map((field) => `- ${field}`).join('\n')}

TRANSCRIPT TO ANALYZE:
${transcript}

INSTRUCTIONS:
1. Read the transcript carefully and extract ALL relevant information
2. The report_title should be SHORT and CONCISE (maximum 6-8 words). It should be a brief, general description of the situation (e.g., "Workplace Harassment Incident", "Safety Violation on Site", "Discrimination During Training"). Keep it simple and descriptive, not a full sentence.
3. For report_type: You MUST select 1-2 MOST SPECIFIC violation types from the VALID REPORT TYPES list that best match the incident. Be precise and specific:
   - Analyze the transcript carefully to identify the EXACT type of violation
   - Choose the most specific violation type(s) that accurately describe the situation
   - PAY SPECIAL ATTENTION to discrimination-based incidents:
     * Anti-LGBTQ+ Discrimination: Comments, slurs, or behavior targeting LGBTQ+ individuals, their identity, orientation, or expression
     * Racism: Comments, slurs, or behavior targeting someone's race, ethnicity, or cultural background
     * Sexism: Comments or behavior that discriminates against or stereotypes based on gender
     * Religious Discrimination: Comments or behavior targeting someone's religious beliefs or practices
     * Age Discrimination: Comments or behavior targeting someone based on their age
   - If the incident involves harassment, determine if it's "Verbal Harassment", "Physical Harassment", "Sexual Harassment", or just "Harassment" based on the specific nature described
   - If multiple types could apply, select the 1-2 that are MOST RELEVANT and SPECIFIC to what actually happened
   - Avoid generic selections - be precise about the type of incident
   - Examples:
     * Sexist comments angrily about women → ["Sexism", "Verbal Harassment"]
     * Anti-LGBTQ+ slurs or discriminatory comments → ["Anti-LGBTQ+ Discrimination", "Verbal Harassment"]
     * Racist comments or behavior → ["Racism", "Discrimination"]
     * Physical contact or threat of physical harm → ["Physical Harassment", "Workplace Violence"]
     * Intimidation or threats → ["Threats", "Intimidation"]
   - You MUST ONLY use values from the VALID REPORT TYPES list - do not create new types
4. For trades_field: Identify which trade field(s) from the VALID TRADE FIELDS list above are mentioned or relevant. You MUST ONLY use values from that list. If none are mentioned, use an empty array [].
5. The report_desc should be a comprehensive, professional description that includes:
   - A factual account of what happened based on the transcript
   - An unbiased description of the emotional tone, context, and atmosphere observed (e.g., "The speaker's tone was raised and agitated", "The conversation contained language that could be perceived as discriminatory", "The interaction demonstrated frustration and hostility")
   - Professional language that objectively describes emotional context without making judgmental statements
   - Consideration of how the emotional tone and context may have impacted the situation
   Example: If the transcript contains angry, sexist comments, describe it as "The recorded conversation contained language that expressed frustration and made discriminatory remarks regarding gender in the workplace. The speaker's tone was elevated and the content of the discussion included statements that could be considered inappropriate and potentially harmful."
6. List any people mentioned (primaries_involved, witnesses)
7. Note any actions already taken if mentioned
8. Suggest recommended_actions based on the type and severity of incident. Generate comprehensive, trades-workplace-specific actions:
   
   CRITICAL REQUIREMENTS - This app is a bridge for employees to create exposure of workplace incidents. When reports are posted publicly, recommended actions should benefit ALL parties (employees, foremen, HR, staff) who can make change:
   
   - **At least 50% (minimum 4 out of 8 actions) MUST be clearly intended for HR, higher-ups, foremen, supervisors, and management to take**
   - Actions should be written so BOTH employees AND management/HR/foremen can see what needs to be done
   - For management/HR/foremen actions: Use clear, direct language like "HR should...", "Management must...", "Foremen should...", "Supervisors need to..."
   - For employee actions: Write them so employees can take action, but also so management can see what employees need
   - The goal is VISIBILITY and ACTION - employees can see what management should do, and management can see their responsibilities
   - Example good phrasing for management actions: "HR should conduct investigation", "Management must implement disciplinary action", "Foremen should address behavior with involved parties"
   - Example good phrasing for shared actions: "Report incident to supervisor/HR immediately" (employee reports, but shows management needs clear reporting channels)
   
   A. For ALL incidents, include these foundational actions (mix of employee and management actions):
      - "Report the incident to supervisor, site manager, or HR immediately"
      - "HR/Management should document the incident in detail with dates, times, and witnesses"
      - "Preserve and secure any evidence (photos, recordings, written notes) - employees should preserve; management should secure"
      - "HR/Management should provide access to employee assistance programs and mental health resources for affected parties"
   
   B. For SERIOUS incidents involving criminal activity, you MUST include appropriate legal/criminal actions (written for all worksite members to take):
      * Battery/Assault: If the transcript describes physical violence, hitting, striking, or physical harm:
        - "File a police report with local law enforcement"
        - "Contact law enforcement immediately if the situation requires"
        - "Ensure medical attention is sought and injuries are documented"
        - "Consult with legal counsel regarding potential criminal charges"
      * Sexual Assault: If the transcript describes non-consensual sexual contact, sexual violence, or sexual assault:
        - "File a police report immediately - sexual assault is a criminal offense"
        - "Contact local law enforcement and sexual assault support services"
        - "Ensure medical attention is provided and evidence is preserved"
        - "Provide access to sexual assault crisis centers and support hotlines"
        - "Consult with legal counsel specializing in sexual assault cases"
      * Serious Physical Harassment/Workplace Violence: If the transcript describes severe physical threats, weapons, or serious violence:
        - "File a police report with appropriate authorities"
        - "Contact law enforcement immediately if immediate danger exists"
        - "Ensure immediate medical attention is provided if injuries occurred"
   
   C. For STANDARD workplace violations (harassment, discrimination, bullying, etc.), include comprehensive trades-workplace-specific actions:
      
      **Workplace Management & Policy Actions (HR/Management/Foremen should take):**
      - "HR and management should review and update workplace harassment and discrimination policies"
      - "Management should implement a zero-tolerance policy for harassment and discrimination"
      - "HR should establish clear reporting procedures and anonymous reporting mechanisms"
      - "Management should create a workplace code of conduct specific to trades environments"
      - "HR should develop and enforce disciplinary procedures for policy violations"
      - "Management should conduct regular workplace culture assessments and surveys"
      - "Management should establish a workplace safety and inclusion committee"
      
      **Employee-Level Management Actions (Foremen/Supervisors/HR should take):**
      - "Management/HR should conduct immediate investigation with all parties involved"
      - "HR and supervisors should implement appropriate disciplinary action per company policy (verbal warning, written warning, suspension, termination)"
      - "Management should require mandatory training for involved parties on workplace respect and inclusion"
      - "Foremen and supervisors should schedule meetings with involved individuals to address behavior and expectations"
      - "HR should implement performance improvement plans for employees who violated policies"
      - "Management should consider reassignment or separation of conflicting parties if necessary"
      - "HR/Management should provide support and resources for all affected employees"
      - "HR should document all disciplinary actions taken in employee files"
      
      **Trades-Specific Training & Education (Management/HR should implement):**
      - "Management should provide mandatory workplace respect and inclusion training for all employees"
      - "HR should implement bystander intervention training for all workers"
      - "Management should conduct diversity and inclusion workshops specific to trades environments"
      - "HR should provide training on recognizing and addressing harassment and discrimination"
      - "Foremen and supervisors should schedule regular safety briefings that include behavioral expectations"
      - "Management should offer cultural competency training for diverse trades workplaces"
      - "HR should provide leadership training for supervisors and foremen on managing workplace conflicts"
      
      **WorksafeBC & Regulatory Compliance (Management/HR should handle):**
      - "Management/HR should report the incident to WorksafeBC if required by regulations"
      - "HR should review WorksafeBC resources on workplace harassment prevention"
      - "Management should ensure compliance with BC Human Rights Code and employment standards"
      - "HR should consult WorksafeBC guidelines for workplace violence prevention"
      - "Management should review and implement WorksafeBC recommendations for safe work environments"
      - "HR should document incident for regulatory compliance and future reference"
      
      **Support & Follow-Up Actions (HR/Management should provide):**
      - "HR/Management should provide access to employee assistance programs (EAP) for all affected parties"
      - "Management should schedule follow-up meetings to ensure resolution and prevent recurrence"
      - "Foremen and supervisors should monitor workplace environment for continued issues and patterns"
      - "Management should establish and maintain open-door policy for reporting future incidents"
      - "HR should create support networks and resources for affected employees"
      - "Management should ensure confidentiality and protection from retaliation for all reporters"
   
   D. CRITICAL: Order recommended_actions by priority and immediacy following trades workplace standards:
      
      **Priority Order (MUST follow this sequence):**
      
      1. **IMMEDIATE ACTIONS (First Priority)** - Urgent, time-sensitive actions that must happen right away:
         - Safety and protection actions (remove from danger, seek medical attention, contact emergency services)
         - Immediate reporting (report to supervisor/HR immediately, file police report if criminal)
         - Evidence preservation (document incident, preserve recordings/photos, secure evidence)
         - Immediate support (contact crisis services, provide immediate assistance to affected parties)
         Examples: "Report the incident to supervisor immediately", "Seek medical attention if injured", "File a police report", "Preserve all evidence including recordings"
      
      2. **TECHNICAL/HEAVY ACTIONS (Second Priority)** - Formal processes, investigations, and compliance:
         - Formal investigations (conduct investigation, interview parties, gather statements)
         - Disciplinary actions (implement disciplinary measures, warnings, suspensions, terminations)
         - Regulatory compliance (report to WorksafeBC, ensure regulatory compliance, document for legal purposes)
         - Policy implementation (review policies, implement procedures, establish reporting mechanisms)
         Examples: "Conduct formal investigation with all parties", "Implement disciplinary action per company policy", "Report incident to WorksafeBC if required", "Review and update workplace policies"
      
      3. **FOLLOW-UP/TRAINING/AWARENESS (Third Priority)** - Long-term preventive and educational measures:
         - Training programs (mandatory training, workshops, educational programs)
         - Awareness initiatives (diversity training, inclusion programs, cultural competency)
         - Follow-up monitoring (schedule follow-ups, monitor workplace, assess effectiveness)
         - Support networks (establish support systems, create committees, ongoing resources)
         Examples: "Provide mandatory workplace respect training", "Schedule follow-up meetings to ensure resolution", "Establish workplace inclusion committee", "Monitor workplace environment for continued issues"
      
      **Ordering Guidelines:**
      - Always start with immediate safety and reporting actions
      - Follow with formal processes (investigations, disciplinary, compliance) - THESE SHOULD BE PRIMARILY MANAGEMENT/HR ACTIONS
      - End with training, awareness, and long-term follow-up - THESE SHOULD BE PRIMARILY MANAGEMENT/HR ACTIONS
      - Within each category, order by urgency (most urgent first)
      - Criminal actions (police reports, legal counsel) should be in the immediate actions section if applicable
      - Generate 5-7 comprehensive actions total (maximum 7), distributed across all three priority levels
      - Be specific to trades workplaces (mention supervisors, foremen, site managers, crews, etc.)
      - Tailor actions to the specific type of incident (e.g., discrimination incidents should include diversity training)
      - The severity should be determined by the actual content of the transcript - only suggest criminal actions if the transcript clearly describes criminal behavior
      - Always include both workplace actions AND criminal actions when applicable - do not replace one with the other
      - Be specific: Use clear action statements rather than vague suggestions
      - **CRITICAL - REMEMBER THIS APP IS A BRIDGE FOR EXPOSURE**: 
        * At least 50% (minimum 3-4 out of 7) of actions MUST be clearly for HR, management, foremen, supervisors, and higher-ups
        * Write actions so employees can see what management should do, and management can see their responsibilities
        * Use explicit language: "HR should...", "Management must...", "Foremen should...", "Supervisors need to..." for management actions
        * For employee actions, write them clearly but also show what management needs to provide (e.g., "Report to supervisor" shows employees need clear reporting channels)
        * The goal is VISIBILITY - when reports are posted publicly, all parties (employees, foremen, HR, staff) can see what actions need to be taken
        * Actions should create accountability - employees can see what management should do, management can see their responsibilities
        * Avoid vague actions - be specific about WHO should do WHAT
9. Extract location if mentioned

CRITICAL: For report_type and trades_field, you MUST ONLY use the exact values from the lists provided above. Do NOT create new values or use variations.

For information NOT in the transcript, use empty arrays [] or empty strings "". Do NOT invent information that is not present in the transcript.

Respond with ONLY valid JSON, no additional text before or after.`;

    const response = await fetch(
      'https://m3rcwp4vofeta3kqelrykbgosi0rswzn.lambda-url.ca-central-1.on.aws/',
      {
        method: 'POST',
        body: JSON.stringify({
          prompt,
          project_name: 'safespace',
        }),
      }
    );

    const responseData = await response.json();

    // Handle both stringified JSON and direct object response
    let json: { url: string };
    if (typeof responseData === 'string') {
      json = JSON.parse(responseData);
    } else {
      json = responseData;
    }

    console.log('Report generation URL:', json.url);
    const reportResponse: any = await RetrieveResponse(json.url);
    const rawText = reportResponse.answer || '';

    // Parse the response into structured data
    const structuredData = parseReportResponse(rawText, baseData);

    // Validate and filter report_type and trades_field to only include valid values
    if (structuredData.report_type) {
      structuredData.report_type = validateReportTypes(structuredData.report_type);
    }
    if (structuredData.trades_field) {
      structuredData.trades_field = validateTradeFields(structuredData.trades_field);
    }

    return {
      text: rawText,
      data: structuredData,
    };
  } catch (err) {
    console.error('Report Generation Error', err);
    return undefined;
  }
};
