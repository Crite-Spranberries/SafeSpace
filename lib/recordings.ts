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
    durationLabel: '10:12',
    createdAtISO: '2025-03-20T09:30:00.000Z',
    tags: ['Misgendering', 'Equality'],
    location: '6200 Kingsway, Burnaby, BC',
    isImmutable: true,
  },
  {
    id: 'default-recording-2',
    title: 'Uncomfortable Comments at Work',
    date: 'May 7, 2025',
    timestamp: '5:30',
    durationMillis: 132000,
    durationLabel: '2:12',
    createdAtISO: '2025-05-07T05:30:00.000Z',
    tags: ['Harassment', 'Equality'],
    location: '8200 Kingsway, Burnaby, BC',
    isImmutable: true,
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
