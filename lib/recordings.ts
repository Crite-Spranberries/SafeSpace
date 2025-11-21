import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@SafeSpace:recordings';

export type StoredRecording = {
  id: string;
  uri: string;
  title: string;
  date: string;
  timestamp: string;
  durationMillis: number;
  durationLabel: string;
  createdAtISO: string;
  tags?: string[];
  location?: string;
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

export const loadRecordings = async (): Promise<StoredRecording[]> => {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return parseRecordings(raw);
};

export const addRecording = async (recording: StoredRecording) => {
  const existing = await loadRecordings();
  const next = [recording, ...existing];
  await serializeRecordings(next);
  return next;
};

export const deleteRecording = async (id: string) => {
  const existing = await loadRecordings();
  const next = existing.filter((item) => item.id !== id);
  await serializeRecordings(next);
  return next;
};

export const getRecordingById = async (id: string) => {
  const existing = await loadRecordings();
  return existing.find((item) => item.id === id);
};