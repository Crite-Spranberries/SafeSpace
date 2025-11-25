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
  // Remove markdown code blocks
  let cleaned = content
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '');
  
  // Remove any RAGQuery or function call artifacts
  cleaned = cleaned.replace(/\[?\{"name":\s*"RAGQuery"[^\]]*\]?/g, '');
  
  // Try to find a complete JSON object
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0].trim();
  }
  
  // Fallback: clean line by line
  return cleaned
    .split('\n')
    .filter((line) => {
      const trimmed = line.trim().toLowerCase();
      return (
        trimmed &&
        !trimmed.startsWith('user:') &&
        !trimmed.startsWith('assistant:') &&
        !trimmed.startsWith('-') && // Remove list items
        trimmed !== 'user' &&
        trimmed !== 'assistant'
      );
    })
    .join('\n')
    .trim();
}

function extractNextQuestion(content: string): WatsonResult | null {
  let parsed: any = null;
  
  try {
    parsed = JSON.parse(content);
  } catch {
    // Try to extract JSON object from mixed content
    // Look for the first complete JSON object
    const jsonMatch = content.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/);
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch {
        return null;
      }
    } else {
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
      // Remove any stray quotes or JSON formatting from the question
      question = question.replace(/^["']|["']$/g, '').trim();
    }
    
    return {
      displayText: question,
      fullData: validateAndFixData(parsed),
    };
  }

  return null;
}

function validateAndFixData(data: any): any {
  // Ensure all required fields exist and are the correct type
  const fixed: any = {
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
    const messages = [];
    
    if (conversationHistory.length === 0) {
      messages.push({
        role: 'system' as const,
        content: `You are Safi, an incident report assistant. Your job is to collect information about workplace incidents by asking ONE question at a time.

CRITICAL RULES:
1. You MUST respond with ONLY valid JSON - no extra text, explanations, or markdown
2. ACCUMULATE information - keep all previously gathered data in each response
3. Only update/add fields based on the user's latest answer
4. NEVER reset or lose previously collected information

EXACT JSON FORMAT (no other text allowed):
{"report_title":"Brief incident summary","report_type":["type1","type2"],"trades_field":["trade1"],"report_description":"Full detailed description","parties_involved":["person1","person2"],"witnesses":["witness1"],"next_question":"Your next question?"}

FIELD ACCUMULATION RULES:
- report_title: Create a clear, brief title once you understand the incident
- report_type: Array of incident types (Harassment, Bullying, Discrimination, Safety Violation, etc.) - ADD to this as you learn more
- trades_field: Array of relevant trades (Electrical, Plumbing, Carpentry, etc.) - ADD to this as you learn more
- report_description: ACCUMULATE all details in ONE continuous string - append new information to existing description
- parties_involved: Array of all people mentioned - ADD new names, keep existing ones
- witnesses: Array of witness names - ADD new witnesses, keep existing ones
- next_question: Your next question to ask (single string)

IMPORTANT: Each response must include ALL information gathered so far, plus any new information from the current answer.

Start with a friendly greeting and ask what happened. When you have sufficient details (incident type, description, parties involved), set next_question to: "That's all the information I need, thank you for sharing."`,
      });
    }
    
    messages.push(
      ...conversationHistory,
      {
        role: 'user' as const,
        content: userMessage,
      }
    );

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
