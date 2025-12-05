import AsyncStorage from '@react-native-async-storage/async-storage';
import { Asset } from 'expo-asset';
import { ReportData, createEmptyReportData } from './reportData';

const STORAGE_KEY = '@SafeSpace:recordings';
const DEFAULT_AUDIO_MODULE = require('@/assets/audio/test_audio.mp3');
let cachedDefaultAudioUri: string | null = null;

export type StoredRecording = {
  id: string;
  uri: string;
  title: string;
  date: string; // Formatted date string for display
  timestamp: string; // Formatted time string for display
  durationMillis: number;
  durationLabel: string;
  createdAtISO: string;
  tags?: string[]; // Legacy field, maps to report_type
  location?: string; // Legacy field, maps to location_name
  transcript?: string;
  report?: string; // Legacy: raw report text
  reportData?: Partial<ReportData>; // New: structured report data
  isImmutable?: boolean;
};

type DefaultRecordingTemplate = Omit<StoredRecording, 'uri'>;

const DEFAULT_RECORDING_TEMPLATES: DefaultRecordingTemplate[] = [
  {
    id: 'default-recording-1',
    title: 'My Supervisor Keeps Misgendering Me',
    date: 'March 20, 2025',
    timestamp: '9:30',
    durationMillis: 612000,
    durationLabel: '2:46',
    createdAtISO: '2025-03-20T09:30:00.000Z',
    tags: ['Anti-LGBTQ+ Discrimination', 'Verbal Harassment'],
    location: '6200 Kingsway, Burnaby, BC',
    isImmutable: true,
    reportData: {
      isPublic: false,
      report_method: 'voice_recording',
      report_id: 'default-recording-1',
      report_title: 'My Supervisor Keeps Misgendering Me',
      month: 'March',
      day: 20,
      year: 2025,
      time: 930,
      audio_URI: '',
      audio_duration: 612000,
      location_name: '6200 Kingsway, Burnaby, BC',
      location_coords: [49.2258, -123.003], // Approximate coordinates for 6200 Kingsway, Burnaby
      report_type: ['Anti-LGBTQ+ Discrimination', 'Verbal Harassment'],
      trades_field: ['Carpentry'],
      report_desc:
        "The recording captured a workplace interaction where a supervisor repeatedly misgendered an employee despite multiple corrections. The conversation demonstrated a pattern of disrespect for gender identity, with the supervisor maintaining a dismissive tone throughout. The emotional context showed clear frustration and distress from the employee, while the supervisor appeared unwilling to acknowledge or correct their behavior. This created a hostile work environment that undermined the employee's sense of safety and belonging.",
      report_transcript:
        "My supervisor keeps using the wrong pronouns for me. I've corrected them multiple times, but they just ignore it or make excuses. It makes me feel disrespected and uncomfortable at work.",
      primaries_involved: ['Supervisor'],
      witnesses: [],
      actions_taken: ['Corrected supervisor multiple times'],
      recommended_actions: [
        'Provide LGBTQ+ inclusion and pronoun training',
        'Establish clear policies on respectful communication',
        'Implement accountability measures',
      ],
    },
  },
  {
    id: 'default-recording-2',
    title: 'Uncomfortable Comments at Work',
    date: 'May 7, 2025',
    timestamp: '5:30',
    durationMillis: 132000,
    durationLabel: '1:37',
    createdAtISO: '2025-05-07T05:30:00.000Z',
    tags: ['Sexism', 'Verbal Harassment'],
    location: '8200 Kingsway, Burnaby, BC',
    isImmutable: true,
    reportData: {
      isPublic: false,
      report_method: 'voice_recording',
      report_id: 'default-recording-2',
      report_title: 'Uncomfortable Comments at Work',
      month: 'May',
      day: 7,
      year: 2025,
      time: 530,
      audio_URI: '',
      audio_duration: 132000,
      location_name: '8200 Kingsway, Burnaby, BC',
      location_coords: [49.218, -123.004], // Approximate coordinates for 8200 Kingsway, Burnaby
      report_type: ['Sexism', 'Verbal Harassment'],
      trades_field: ['Welding'],
      report_desc:
        "The recording documented inappropriate and sexist comments made by a coworker during a work shift. The conversation contained language that stereotyped and demeaned women in the workplace. The speaker's tone was dismissive and the comments created an uncomfortable and unprofessional environment. The emotional context showed clear discomfort and frustration from those present, while the speaker appeared unaware or unconcerned about the impact of their words.",
      report_transcript:
        'A coworker made several inappropriate comments about women in the workplace. The comments were sexist and made me and others feel uncomfortable. When I tried to address it, they just laughed it off.',
      primaries_involved: ['Coworker'],
      witnesses: ['Other Workers'],
      actions_taken: ['Attempted to address the comments'],
      recommended_actions: [
        'Provide bystander intervention training',
        'Implement zero-tolerance harassment policy',
        'Conduct workplace respect training',
      ],
    },
  },
];

const resolveDefaultAudioUri = async () => {
  if (cachedDefaultAudioUri) {
    return cachedDefaultAudioUri;
  }
  const asset = Asset.fromModule(DEFAULT_AUDIO_MODULE);
  if (!asset.downloaded) {
    try {
      await asset.downloadAsync();
    } catch (err) {
      console.warn('Failed to download default recording asset', err);
    }
  }
  cachedDefaultAudioUri = asset.localUri ?? asset.uri ?? '';
  return cachedDefaultAudioUri;
};

const resolveDefaultRecordings = async (): Promise<StoredRecording[]> => {
  const audioUri = await resolveDefaultAudioUri();
  if (!audioUri) {
    console.warn('Default recording asset missing URI');
  }

  return DEFAULT_RECORDING_TEMPLATES.map((template) => ({
    ...template,
    uri: audioUri,
  }));
};

const parseRecordings = (raw: string | null): StoredRecording[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((item) => typeof item === 'object' && item !== null);
    }
    return [];
  } catch (err) {
    console.warn('Failed to parse stored recordings', err);
    return [];
  }
};

const serializeRecordings = async (items: StoredRecording[]) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn('Failed to persist recordings', err);
  }
};

const ensureDefaultRecordings = async (items: StoredRecording[]) => {
  const defaults = await resolveDefaultRecordings();
  let mutated = false;
  const merged = [...items];

  defaults.forEach((defaultRecording) => {
    const index = merged.findIndex((item) => item.id === defaultRecording.id);
    if (index === -1) {
      merged.push(defaultRecording);
      mutated = true;
      return;
    }

    const existing = merged[index];
    const tagsChanged = (existing.tags ?? []).join('|') !== (defaultRecording.tags ?? []).join('|');

    const needsUpdate =
      existing.uri !== defaultRecording.uri ||
      existing.title !== defaultRecording.title ||
      existing.date !== defaultRecording.date ||
      existing.timestamp !== defaultRecording.timestamp ||
      existing.durationMillis !== defaultRecording.durationMillis ||
      existing.durationLabel !== defaultRecording.durationLabel ||
      existing.createdAtISO !== defaultRecording.createdAtISO ||
      existing.location !== defaultRecording.location ||
      tagsChanged ||
      existing.isImmutable !== defaultRecording.isImmutable;

    if (needsUpdate) {
      merged[index] = {
        ...existing,
        ...defaultRecording,
      };
      mutated = true;
    }
  });

  if (mutated) {
    await serializeRecordings(merged);
  }

  return merged;
};

export const loadRecordings = async (): Promise<StoredRecording[]> => {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  const parsed = parseRecordings(raw);
  return ensureDefaultRecordings(parsed);
};

export const addRecording = async (recording: StoredRecording) => {
  const existing = await loadRecordings();
  const next = [recording, ...existing];
  await serializeRecordings(next);
  return next;
};

export const deleteRecording = async (id: string) => {
  const existing = await loadRecordings();
  const candidate = existing.find((item) => item.id === id);
  if (candidate?.isImmutable) {
    return existing;
  }
  const next = existing.filter((item) => item.id !== id);
  await serializeRecordings(next);
  return next;
};

export const updateRecording = async (id: string, updates: Partial<StoredRecording>) => {
  const existing = await loadRecordings();
  const index = existing.findIndex((item) => item.id === id);
  if (index === -1) return existing;

  const updated = { ...existing[index], ...updates };
  existing[index] = updated;
  await serializeRecordings(existing);
  return existing;
};

export const getRecordingById = async (id: string) => {
  const existing = await loadRecordings();
  return existing.find((item) => item.id === id);
};
