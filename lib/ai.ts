import * as FileSystem from 'expo-file-system/legacy';
import { RetrieveResponse } from 'roughlyai';
import { Asset } from 'expo-asset';
import {
  ReportData,
  createEmptyReportData,
  mergeReportData,
  createReportDataFromDate,
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
      return {
        ...baseData,
        report_title: parsed.report_title || baseData.report_title || '',
        report_type: Array.isArray(parsed.report_type)
          ? parsed.report_type
          : baseData.report_type || [],
        trades_field: Array.isArray(parsed.trades_field)
          ? parsed.trades_field
          : baseData.trades_field || [],
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
          ? parsed.recommended_actions
          : baseData.recommended_actions || [],
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
  "report_title": "Brief descriptive title based on what happened in the transcript",
  "report_type": ["array of incident types mentioned or implied in the transcript (e.g., Harassment, Discrimination, Bullying, etc.)"],
  "trades_field": ["array of relevant trade fields mentioned in the transcript (e.g., Electrical, Plumbing, Carpentry, etc.)"],
  "report_desc": "Detailed description of the incident based EXACTLY on what is described in the transcript",
  "primaries_involved": ["array of people involved as mentioned in the transcript"],
  "witnesses": ["array of witness names if mentioned in the transcript"],
  "actions_taken": ["array of actions already taken as described in the transcript"],
  "recommended_actions": ["array of recommended next steps based on the incident described"],
  "location_name": "location if mentioned in the transcript"
}

TRANSCRIPT TO ANALYZE:
${transcript}

INSTRUCTIONS:
1. Read the transcript carefully and extract ALL relevant information
2. The report_title should summarize the main incident described in the transcript
3. Identify report_type(s) based on what type of incident is described (harassment, discrimination, safety violation, etc.)
4. Identify trades_field(s) if any trade or profession is mentioned
5. The report_desc should be a comprehensive description of what happened based on the transcript
6. List any people mentioned (primaries_involved, witnesses)
7. Note any actions already taken if mentioned
8. Suggest recommended_actions based on the type of incident
9. Extract location if mentioned

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

    return {
      text: rawText,
      data: structuredData,
    };
  } catch (err) {
    console.error('Report Generation Error', err);
    return undefined;
  }
};
