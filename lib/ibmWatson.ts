import Constants from 'expo-constants';

// Types
type Role = 'system' | 'user' | 'assistant';

export interface ReportData {
  report_title: string;
  report_type: string[];
  trades_field: string[];
  report_description: string;
  parties_involved: string[];
  witnesses: string[];
  next_question: string;
}

interface WatsonMessage {
  role: Role;
  content: string;
}

interface WatsonChoice {
  message: {
    content: string;
  };
}

function logWatsonResult(result: WatsonResult) {
  console.log(
    JSON.stringify(
      {
        watson: 'result',
        result,
      },
      null,
      2
    )
  );
}

function logWatsonRequest(userText: string, historyLen: number) {
  console.log(
    JSON.stringify(
      {
        watson: 'request',
        user: userText,
        historyLength: historyLen,
      },
      null,
      2
    )
  );
}

// Try to get from Constants first, then fall back to direct env access
const API_KEY =
  Constants.expoConfig?.extra?.ibmApiKey ||
  process.env.IBM_API_KEY ||
  process.env.EXPO_PUBLIC_IBM_API_KEY ||
  '';
const IAM_URL = 'https://iam.cloud.ibm.com/identity/token';
const SCORING_URL =
  Constants.expoConfig?.extra?.ibmScoringUrl ||
  process.env.IBM_SCORING_URL ||
  process.env.EXPO_PUBLIC_IBM_SCORING_URL ||
  '';

if (!API_KEY) {
  console.warn(
    'Missing IBM API key. Set environment variable IBM_API_KEY before running this app.'
  );
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface WatsonResponse {
  choices?: WatsonChoice[];
  [key: string]: any;
}

export interface WatsonResult {
  displayText: string;
  fullData: ReportData | null;
}

// Prompt
const SYSTEM_PROMPT = `You are Safi, an incident report assistant. Respond immediately with JSON only. Do NOT greet or add any non-JSON text.

CRITICAL: Respond ONLY with valid JSON. NO greetings, NO extra text before or after the JSON object.

JSON FORMAT:
{"report_title":"Brief title","report_type":["Type1"],"trades_field":["Trade1"],"report_description":"Detailed description","parties_involved":["Person1"],"witnesses":["Witness1"],"next_question":"Your question?"}

RULES:
1. ACCUMULATE data - never lose previously collected information
2. Update fields based on new user answers
3. Ask ONE clear, specific question at a time.
  - Do NOT output bullet lists, multiple questions, or numbered steps.
  - Do NOT output function/tool calls (e.g., RAGQuery) or any keys other than those in the JSON format.
  - Do NOT ask the user to rephrase, summarize, confirm formatting, describe policies/procedures, or talk about processing. Avoid meta/process questions.
  - If the user has already described the incident, do NOT ask for a description again.
4. When you have enough information (incident type, description, who was involved), ONLY THEN set next_question to: "That's all the information I need, thank you for sharing."

FIELD GUIDELINES:
- report_title: Brief summary (create once incident is clear)
- report_type: ["Harassment"], ["Bullying"], ["Discrimination"], ["Safety Violation"], etc.
- trades_field: ["Electrical"], ["Plumbing"], ["Carpentry"], etc.
- report_description: Accumulate all details in one continuous string
- parties_involved: Names of people involved
- witnesses: Names of witnesses
- next_question: Your next question (or completion phrase when done)

Do Not ask questions relating to what kind of report the user wants to create, or ask about if they want to make a report.

Do NOT ask questions about what this incident is classified as, or Title. You are meant to generate that information yourself.

Do NOT use greetings or meta/process prompts. Do NOT use the completion phrase until meaningful information is collected.

Here is an example of what it should look like when you have enough information:
{
"report_title":"Workplace Harassment Incident",
"report_type":["harassment", "bullying"],
"trades_field":["electrical"],
"report_description":"A colleague made inappropriate comments and unwanted physical contact during work hours.",
"parties_involved":["John Doe", "Jane Smith"],
"witnesses":["Alice Johnson", "Bob Lee"],
"next_question":"That's all the information I need, thank you for sharing."
}`;

/**
 * Makes a POST request using fetch API
 */
async function httpPost(
  url: string,
  headers: Record<string, string> = {},
  body: string = ''
): Promise<string> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': headers['Content-Type'] || 'application/json',
      },
      body: body,
    });

    const text = await response.text();

    if (!response.ok) {
      // Try to parse error response as JSON if possible
      let errorMessage = text || response.statusText;
      try {
        const errorJson = JSON.parse(text);
        if (errorJson.error || errorJson.message) {
          errorMessage = errorJson.error || errorJson.message;
        }
      } catch {
        // Not JSON, use text as-is
      }
      throw new Error(`HTTP ${response.status} when POST ${url}: ${errorMessage}`);
    }

    // Check content type if available
    const contentType = response.headers.get('content-type') || '';
    if (
      contentType &&
      !contentType.includes('application/json') &&
      !contentType.includes('text/json')
    ) {
      console.warn(
        `Unexpected content type: ${contentType}. Response preview: ${text.substring(0, 200)}`
      );
      // If it's HTML or plain text, we might still want to try parsing it
      // But log a warning
    }

    return text;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(`Network error posting to ${url}: ${err.message}`);
    }
    throw err;
  }
}

/**
 * Retrieves an access token from IBM Cloud IAM
 */
async function getToken(): Promise<string> {
  const body =
    'grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=' + encodeURIComponent(API_KEY);
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    Accept: 'application/json',
  };

  const text = await httpPost(IAM_URL, headers, body);

  let parsed: any;
  try {
    parsed = JSON.parse(text);
  } catch (ex) {
    throw new Error(
      'Failed to parse IAM token response: ' + (ex instanceof Error ? ex.message : String(ex))
    );
  }

  if (!parsed.access_token) {
    throw new Error('IAM response did not contain an access_token: ' + text);
  }

  return parsed.access_token;
}

/**
 * Makes a request to the IBM Watson scoring endpoint
 */
async function apiPost(
  scoring_url: string,
  token: string,
  payloadObj: object | string
): Promise<WatsonResponse> {
  const headers = {
    Accept: 'application/json',
    Authorization: 'Bearer ' + token,
    'Content-Type': 'application/json;charset=UTF-8',
  };

  const payloadText = typeof payloadObj === 'string' ? payloadObj : JSON.stringify(payloadObj);

  const text = await httpPost(scoring_url, headers, payloadText);

  // Check if response looks like JSON (starts with { or [)
  const trimmedText = text.trim();
  if (!trimmedText.startsWith('{') && !trimmedText.startsWith('[')) {
    // Response is not JSON - might be HTML error page or plain text
    console.error('Response is not JSON, received:', text.substring(0, 200));
    throw new Error(
      `API returned non-JSON response. This might be an error message: ${text.substring(0, 100)}`
    );
  }

  try {
    return JSON.parse(text);
  } catch (ex) {
    // Try to extract valid JSON from the response if it's wrapped in extra text
    try {
      // Look for JSON object with balanced braces
      const firstBrace = text.indexOf('{');
      if (firstBrace !== -1) {
        let braceCount = 0;
        let inString = false;
        let escapeNext = false;
        let jsonEnd = -1;

        for (let i = firstBrace; i < text.length; i++) {
          const char = text[i];

          if (escapeNext) {
            escapeNext = false;
            continue;
          }

          if (char === '\\') {
            escapeNext = true;
            continue;
          }

          if (char === '"') {
            inString = !inString;
            continue;
          }

          if (!inString) {
            if (char === '{') braceCount++;
            if (char === '}') braceCount--;

            if (braceCount === 0) {
              jsonEnd = i + 1;
              break;
            }
          }
        }

        if (jsonEnd > firstBrace) {
          const jsonStr = text.substring(firstBrace, jsonEnd);
          return JSON.parse(jsonStr);
        }
      }

      // Fallback: try regex match
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (innerEx) {
      // If that also fails, log the error and throw
      console.error('Failed to parse scoring response. First 500 chars:', text.substring(0, 500));
      throw new Error(
        `Failed to parse scoring response. The API may have returned an error: ${text.substring(0, 150)}`
      );
    }
    throw new Error(
      `Failed to parse scoring response. The API may have returned an error: ${text.substring(0, 150)}`
    );
  }
}

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelayMs: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      const isLastAttempt = i === maxRetries - 1;
      const message = err instanceof Error ? err.message : String(err);
      const retryable = /HTTP\s(429|503)/.test(message);

      if (retryable && !isLastAttempt) {
        const jitter = Math.floor(Math.random() * 200);
        const delayMs = initialDelayMs * Math.pow(2, i) + jitter;
        console.warn(`[Watson] Retrying in ${delayMs}ms due to ${message}`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }
      throw err;
    }
  }
  throw new Error('[Watson] Max retries exceeded');
}

function cleanJsonContent(content: string): string {
  // Remove markdown code blocks
  let cleaned = content.replace(/```json\s*/g, '').replace(/```\s*/g, '');

  // Remove any RAGQuery or function call artifacts (multiple patterns)
  cleaned = cleaned.replace(/\[?\s*\{"name":\s*"RAGQuery"[^\]]*\]?\s*/g, '');
  cleaned = cleaned.replace(/\{"name":\s*"[^"]*",\s*"arguments":\s*\{[^}]*\}\}/g, '');

  // Remove hallucination metadata markers
  cleaned = cleaned.replace(/\{"id":\s*"hallucination"[^}]*\}/g, '');

  // Remove completion phrase noise before JSON detection
  // We keep bullet points now in case they contain the actual question in plain text
  cleaned = cleaned
    .split('\n')
    .filter((line) => {
      const l = line.trim();
      // const lower = l.toLowerCase();
      if (!l) return false;
      // if (l.startsWith('- ') || l.startsWith('•') || l.match(/^\d+\./)) return false;
      // if (lower.includes("that's all the information i need")) return false;
      return true;
    })
    .join('\n');

  // If the content looks like a function call object only, return empty
  if (cleaned.trim().startsWith('{"name":') || cleaned.trim().startsWith('{"arguments":')) {
    return '{}';
  }

  // Find the first complete JSON object with balanced braces
  // This extracts ONLY the JSON, ignoring any text before or after
  const firstBrace = cleaned.indexOf('{');
  if (firstBrace !== -1) {
    let braceCount = 0;
    let inString = false;
    let escapeNext = false;

    for (let i = firstBrace; i < cleaned.length; i++) {
      const char = cleaned[i];

      if (escapeNext) {
        escapeNext = false;
        continue;
      }

      if (char === '\\') {
        escapeNext = true;
        continue;
      }

      if (char === '"') {
        inString = !inString;
        continue;
      }

      if (!inString) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;

        if (braceCount === 0) {
          return cleaned.substring(firstBrace, i + 1).trim();
        }
      }
    }
  }

  // If no valid JSON object found, return the cleaned text if it exists, otherwise empty JSON
  // This allows plain text questions to survive and be caught by the fallback logic
  return cleaned.trim() || '{}';
}

function extractNextQuestion(content: string): WatsonResult | null {
  let parsed: any = null;

  try {
    parsed = JSON.parse(content);
  } catch (parseError) {
    // Try to extract JSON object from mixed content
    // Look for the first complete JSON object with balanced braces
    try {
      const firstBrace = content.indexOf('{');
      if (firstBrace !== -1) {
        let braceCount = 0;
        let inString = false;
        let escapeNext = false;
        let jsonEnd = -1;

        for (let i = firstBrace; i < content.length; i++) {
          const char = content[i];

          if (escapeNext) {
            escapeNext = false;
            continue;
          }

          if (char === '\\') {
            escapeNext = true;
            continue;
          }

          if (char === '"') {
            inString = !inString;
            continue;
          }

          if (!inString) {
            if (char === '{') braceCount++;
            if (char === '}') braceCount--;

            if (braceCount === 0) {
              jsonEnd = i + 1;
              break;
            }
          }
        }

        if (jsonEnd > firstBrace) {
          const jsonStr = content.substring(firstBrace, jsonEnd);
          parsed = JSON.parse(jsonStr);
        } else {
          // Fallback to regex if balanced brace extraction fails
          const jsonMatch = content.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/);
          if (jsonMatch) {
            parsed = JSON.parse(jsonMatch[0]);
          } else {
            console.warn('Could not extract JSON from content:', content.substring(0, 200));
            return null;
          }
        }
      } else {
        // No opening brace found
        return null;
      }
    } catch (extractError) {
      console.warn('JSON extraction failed:', extractError);
      return null;
    }
  }

  // Handle array format
  if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].next_question) {
    return {
      displayText: parsed[0].next_question,
      fullData: validateAndFixData(parsed[0]),
    };
  }

  // Handle object format
  if (parsed && parsed.next_question) {
    // Clean the next_question if it contains JSON formatting
    let question = parsed.next_question;
    if (typeof question === 'string') {
      // Normalize and sanitize greetings/meta/bullets
      const original = question;
      question = question.replace(/^["']|["']$/g, '').trim();
      // Strip common greeting prefixes
      question = question.replace(/^hi,? i'm safi[.,\s]*/i, '').trim();
      question = question.replace(/^hello,? i'm safi[.,\s]*/i, '').trim();
      // Remove leading bullet markers and numbering
      question = question.replace(/^(?:-\s*|•\s*|\d+\.\s*)/gm, '');
      // Collapse to first interrogative sentence
      const qMatch = question.match(/[^.?!]*\?+/);
      if (qMatch) {
        question = qMatch[0].trim();
      }
      // Remove meta prompts
      const metaPatterns = [
        /rephrase/i,
        /processing/i,
        /\bformat\b/i,
        /policy|policies|procedures/i,
        /better understand/i,
        /fill out the report/i,
      ];
      if (metaPatterns.some((p) => p.test(original))) {
        // Default to a concrete next question
        if (!/\?/.test(question) || question.length < 5) {
          question = 'Who was involved in the incident?';
        }
      }
    }

    return {
      displayText: question,
      fullData: validateAndFixData(parsed),
    };
  }

  return null;
}

function validateAndFixData(data: any): ReportData {
  // Ensure all required fields exist and are the correct type
  const fixed: ReportData = {
    report_title: data.report_title || '',
    report_type: Array.isArray(data.report_type) ? data.report_type : [],
    trades_field: Array.isArray(data.trades_field) ? data.trades_field : [],
    report_description: '',
    parties_involved: Array.isArray(data.parties_involved) ? data.parties_involved : [],
    witnesses: Array.isArray(data.witnesses) ? data.witnesses : [],
    next_question: data.next_question || '',
  };

  // Handle report_description - collect all string values that aren't part of arrays
  const descriptionParts: string[] = [];

  if (typeof data.report_description === 'string' && data.report_description.trim()) {
    descriptionParts.push(data.report_description.trim());
  } else if (Array.isArray(data.report_description)) {
    // If it's an array, join all strings
    descriptionParts.push(...data.report_description.filter((v: any) => typeof v === 'string'));
  }

  // Check for any extra string fields that should be part of description
  const knownFields = new Set([
    'report_title',
    'report_type',
    'trades_field',
    'report_description',
    'parties_involved',
    'witnesses',
    'next_question',
    'complete',
  ]);
  for (const [key, value] of Object.entries(data)) {
    if (!knownFields.has(key) && typeof value === 'string' && value.trim()) {
      descriptionParts.push(value.trim());
    }
  }

  fixed.report_description = descriptionParts.join(' ');

  return fixed;
}

/**
 * Send a message to IBM Watson and get a response
 * @param userMessage - The current user message
 * @param conversationHistory - Array of previous messages in the conversation
 */
export async function sendMessage(
  userMessage: string,
  conversationHistory: ChatMessage[] = []
): Promise<WatsonResult> {
  if (!API_KEY) {
    throw new Error('IBM API key is not configured. Please set IBM_API_KEY environment variable.');
  }

  if (!SCORING_URL) {
    throw new Error(
      'IBM Scoring URL is not configured. Please set IBM_SCORING_URL environment variable.'
    );
  }

  try {
    const token = await getToken();

    // Build the full conversation with system prompt only at the start
    // Only include system prompt if this is the first message (no history)
    const messages: WatsonMessage[] = [];

    // Always include system prompt to ensure the AI follows rules and maintains persona
    messages.push({ role: 'system', content: SYSTEM_PROMPT });

    messages.push(...conversationHistory, {
      role: 'user' as const,
      content: userMessage,
    });

    const payload: {
      messages: WatsonMessage[];
      temperature: number;
      max_tokens: number;
      response_format: { type: 'json_object' };
    } = {
      messages: messages,
      // Low temperature for deterministic JSON formatting
      temperature: 0.2,
      max_tokens: 400,
      response_format: { type: 'json_object' },
      // Strong hints to avoid tool/function calls and lists if supported by deployment
      // Some deployments ignore extra params; prompt enforces behavior regardless.
    };

    // Log request context as JSON
    try {
      logWatsonRequest(userMessage, conversationHistory.length);
    } catch {}

    const result = await retryWithBackoff(() => apiPost(SCORING_URL, token, payload));

    if (!result.choices || result.choices.length === 0) {
      return {
        displayText: 'I received your message, but the response format was unexpected.',
        fullData: null,
      };
    }

    const raw = result.choices[0].message.content;
    const content = cleanJsonContent(raw);

    // If cleaning yielded no JSON but raw contains the completion phrase alone, ignore it and ask for description
    const completionPhrase = "that's all the information i need";
    if (content === '{}' && typeof raw === 'string') {
      const lowerRaw = raw.toLowerCase();
      const hasBullets = /(^|\n)\s*(-\s|•|\d+\.)/m.test(raw);
      const hasCompletionOnly = lowerRaw.includes(completionPhrase) && !raw.includes('{');
      if (hasCompletionOnly || hasBullets) {
        // Choose a smart next question based on what the user just wrote
        const lastUserMsg =
          [...conversationHistory].reverse().find((m) => m.role === 'user')?.content || '';
        const len = lastUserMsg.trim().length;
        const hasMultiSentences = (lastUserMsg.match(/[.!?]\s+[A-Z]/g) || []).length >= 1;
        // Heuristics: if user provided substantial description, move on to parties involved; else ask for description.
        const nextQ =
          len > 120 || hasMultiSentences
            ? 'Who was involved in the incident?'
            : 'Please describe the incident.';
        return {
          displayText: nextQ,
          fullData: {
            report_title: '',
            report_type: [],
            trades_field: [],
            report_description: '',
            parties_involved: [],
            witnesses: [],
            next_question: nextQ,
          },
        };
      }
    }

    // Try to extract next_question from JSON
    const extracted = extractNextQuestion(content);
    if (extracted) {
      logWatsonResult(extracted);
      return extracted;
    }

    // Fallback for plain text responses (should not happen with json_object mode)
    // If we get here, the response was malformed - try to salvage it
    console.log(
      JSON.stringify(
        {
          watson: 'parse_fallback',
          note: 'JSON parsing failed, attempting plain text salvage',
          content,
        },
        null,
        2
      )
    );
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (
        trimmed &&
        !trimmed.startsWith('[') &&
        !trimmed.startsWith('{') &&
        !trimmed.startsWith('"') &&
        !trimmed.includes('RAGQuery') &&
        trimmed.includes('?')
      ) {
        // Plain text question found - wrap it in a minimal valid structure
        const res: WatsonResult = {
          displayText: trimmed,
          fullData: {
            report_title: '',
            report_type: [],
            trades_field: [],
            report_description: '',
            parties_involved: [],
            witnesses: [],
            next_question: trimmed,
          },
        };
        logWatsonResult(res);
        return res;
      }
    }

    // Last resort: if content looks like plain text, use it as the question
    if (content && !content.startsWith('{') && !content.includes('RAGQuery')) {
      const res: WatsonResult = {
        displayText: content,
        fullData: {
          report_title: '',
          report_type: [],
          trades_field: [],
          report_description: '',
          parties_involved: [],
          witnesses: [],
          next_question: content,
        },
      };
      logWatsonResult(res);
      return res;
    }

    // Final fallback: choose a sensible next question based on recent context
    const lastUserMsg =
      [...conversationHistory].reverse().find((m) => m.role === 'user')?.content || '';
    const len = lastUserMsg.trim().length;
    const hasMultiSentences = (lastUserMsg.match(/[.!?]\s+[A-Z]/g) || []).length >= 1;
    const nextQ =
      len > 120 || hasMultiSentences
        ? 'Who was involved in the incident?'
        : 'Please describe the incident.';
    const res: WatsonResult = {
      displayText: nextQ,
      fullData: {
        report_title: '',
        report_type: [],
        trades_field: [],
        report_description: '',
        parties_involved: [],
        witnesses: [],
        next_question: nextQ,
      },
    };
    logWatsonResult(res);
    return res;
  } catch (err) {
    console.error('Error calling IBM Watson:', err);
    throw err;
  }
}
