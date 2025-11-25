import Constants from 'expo-constants';

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
  choices?: Array<{
    message: {
      content: string;
    };
  }>;
  // Add other possible response fields as needed
  [key: string]: any;
}

export interface WatsonResult {
  displayText: string;
  fullData: any;
}

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
      throw new Error(`HTTP ${response.status} when POST ${url}: ${text || response.statusText}`);
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

  try {
    return JSON.parse(text);
  } catch (ex) {
    throw new Error(
      'Failed to parse scoring response: ' + (ex instanceof Error ? ex.message : String(ex))
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
      const is503 = err instanceof Error && err.message.includes('HTTP 503');

      if (is503 && !isLastAttempt) {
        const delayMs = initialDelayMs * Math.pow(2, i);
        console.warn(`Retrying in ${delayMs}ms due to service unavailable...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      } else {
        throw err;
      }
    }
  }
  throw new Error('Max retries exceeded');
}

function cleanJsonContent(content: string): string {
  return content
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .split('\n')
    .filter((line) => {
      const trimmed = line.trim().toLowerCase();
      return (
        !trimmed.startsWith('user:') &&
        !trimmed.startsWith('assistant:') &&
        trimmed !== 'user' &&
        trimmed !== 'assistant'
      );
    })
    .join('\n')
    .trim();
}

function extractNextQuestion(content: string): WatsonResult | null {
  try {
    const parsed = JSON.parse(content);

    // Handle array format
    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].next_question) {
      return {
        displayText: parsed[0].next_question,
        fullData: validateAndFixData(parsed[0]),
      };
    }

    // Handle object format
    if (parsed.next_question) {
      return {
        displayText: parsed.next_question,
        fullData: validateAndFixData(parsed),
      };
    }
  } catch {
    // Try to extract JSON object from mixed content
    const jsonMatch = content.match(/\{[\s\S]*?"next_question"[\s\S]*?\}(?!\s*,)/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.next_question) {
          return {
            displayText: parsed.next_question,
            fullData: validateAndFixData(parsed),
          };
        }
      } catch {}
    }
  }

  return null;
}

function validateAndFixData(data: any): any {
  // Ensure all required fields exist and are the correct type
  const fixed: any = {
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

    // Limit conversation history to last 6 messages (3 exchanges) to prevent context pollution
    const recentHistory = conversationHistory.slice(-6);

    // Build the full conversation with system prompt and history
    const messages = [
      {
        role: 'system' as const,
        content: `You are Safi, an incident report assistant. Collect information by asking ONE question at a time.

CRITICAL: You MUST respond with ONLY a single valid JSON object. NO extra text, NO arrays, NO multiple objects.

EXACT FORMAT REQUIRED:
{"report_type":["value1"],"trades_field":["value2"],"report_description":"single string description","parties_involved":["person1","person2"],"witnesses":["witness1"],"next_question":"Your question?"}

FIELD RULES:
- report_type: array of incident types (e.g., ["Harassment"], ["Bullying"])
- trades_field: array of trade areas (e.g., ["Electrical"], ["Plumbing"])
- report_description: MUST be a SINGLE STRING containing ALL description details
- parties_involved: array of people names
- witnesses: array of witness names (use [] if none)
- next_question: your next question as a string

DO NOT create multiple sentences as separate JSON properties. ALL description text goes in report_description as ONE string.

When complete, set next_question to: "That's all the information I need, thank you for sharing."`,
      },
      ...recentHistory,
      {
        role: 'user' as const,
        content: userMessage,
      },
    ];

    const payload = {
      messages: messages,
      model: 'gpt-5',
    };

    const result = await retryWithBackoff(() => apiPost(SCORING_URL, token, payload));

    if (!result.choices || result.choices.length === 0) {
      return {
        displayText: 'I received your message, but the response format was unexpected.',
        fullData: null,
      };
    }

    const content = cleanJsonContent(result.choices[0].message.content);

    // Try to extract next_question from JSON
    const extracted = extractNextQuestion(content);
    if (extracted) {
      return extracted;
    }

    // Fallback: look for plain text question
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (
        trimmed &&
        !trimmed.startsWith('[') &&
        !trimmed.startsWith('{') &&
        !trimmed.startsWith('"') &&
        trimmed.includes('?')
      ) {
        return { displayText: trimmed, fullData: content };
      }
    }

    return { displayText: content, fullData: content };
  } catch (err) {
    console.error('Error calling IBM Watson:', err);
    throw err;
  }
}
