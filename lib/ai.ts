import * as FileSystem from 'expo-file-system/legacy';
import { RetrieveResponse } from 'roughlyai';

const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

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

export const generateReport = async (transcript: string) => {
  try {
    const response = await fetch(
      'https://m3rcwp4vofeta3kqelrykbgosi0rswzn.lambda-url.ca-central-1.on.aws/',
      {
        method: 'POST',
        body: JSON.stringify({
          prompt: `Using "report_template.txt" as a template, create a report for the following transcript:
              ${transcript}
              
              For information missing, respond with "Not Provided". Make an educated guess for "Trades field", "Type of Report", "Type of Discrimination", and "Incident Details" based on the transcript.`,
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
    const reportData: any = await RetrieveResponse(json.url);
    return reportData.answer;
  } catch (err) {
    console.error('Report Generation Error', err);
    return undefined;
  }
};
