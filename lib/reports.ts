import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@SafeSpace:reports';

export type StoredReport = {
  id: string;
  title: string;
  date: string;
  timestamp: string;
  location?: string;
  tags?: string[];
  report_type?: string[];
  trades_field?: string[];
  status: 'Posted' | 'Private';
  excerpt?: string;
  content?: string;
  recordingId?: string;
};

const DEFAULT_REPORTS: StoredReport[] = [
  {
    id: 'default-report-1',
    title: 'Unequal Pay for Equal Work',
    date: 'November 6, 2025',
    timestamp: '10:30',
    location: '456 Government St, Burnaby, BC',
    tags: ['Discrimination', 'Pay Inequality'],
    report_type: ['Discrimination', 'Pay Inequality'],
    trades_field: ['Electrical'],
    status: 'Posted',
    excerpt:
      'I noticed that my male colleagues receive higher pay for the same tasks. When I raised the issue, I was ignored and sometimes subtly threatened. It made me feel undervalued and hesitant to speak up again.',
  },
  {
    id: 'default-report-2',
    title: 'Misgendered During Training',
    date: 'January 7, 2025',
    timestamp: '10:30',
    location: '123 Granville St, Burnaby, BC',
    tags: ['Discrimination', 'Harassment'],
    report_type: ['Discrimination', 'Harassment'],
    trades_field: ['Plumbing'],
    status: 'Private',
    excerpt:
      'During a recent apprenticeship training, my supervisor repeatedly referred to me with the wrong pronouns despite me correcting them multiple times.',
  },
];

const parseReports = (raw: string | null): StoredReport[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((item) => typeof item === 'object' && item !== null);
    }
    return [];
  } catch (err) {
    console.warn('Failed to parse stored reports', err);
    return [];
  }
};

const serializeReports = async (items: StoredReport[]) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn('Failed to persist reports', err);
  }
};

export const loadReports = async (): Promise<StoredReport[]> => {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  const parsed = parseReports(raw);

  // Merge defaults if not present
  const merged = [...parsed];
  let mutated = false;

  DEFAULT_REPORTS.forEach((def) => {
    if (!merged.find((r) => r.id === def.id)) {
      merged.push(def);
      mutated = true;
    }
  });

  if (mutated) {
    await serializeReports(merged);
  }

  return merged;
};

export const addReport = async (report: StoredReport) => {
  const existing = await loadReports();
  const next = [report, ...existing];
  await serializeReports(next);
  console.log('Report saved:', report.id);
  return next;
};

export const deleteReport = async (id: string) => {
  const existing = await loadReports();
  const next = existing.filter((item) => item.id !== id);
  await serializeReports(next);
  return next;
};
