import AsyncStorage from '@react-native-async-storage/async-storage';
import { ReportData, createEmptyReportData, mergeReportData } from './reportData';

const STORAGE_KEY = '@SafeSpace:reports';

export type StoredReport = {
  id: string;
  title: string; // Maps to report_title
  date: string; // Formatted date string for display
  timestamp: string; // Formatted time string for display
  location?: string; // Maps to location_name
  tags?: string[]; // Legacy field, maps to report_type
  report_type?: string[];
  trades_field?: string[];
  status: 'Posted' | 'Private'; // Maps to isPublic
  excerpt?: string;
  content?: string; // Legacy: raw report text
  reportData?: Partial<ReportData>; // New: structured report data
  recordingId?: string; // Links to the recording that generated this report
};

/**
 * Converts StoredReport to full ReportData
 */
export const reportToReportData = (report: StoredReport): ReportData => {
  // If reportData exists, use it directly (it's already a full ReportData structure)
  if (report.reportData) {
    return mergeReportData(report.reportData);
  }

  // Otherwise, reconstruct from legacy fields
  const baseData: Partial<ReportData> = {};

  // Map legacy fields to new format
  return mergeReportData({
    ...baseData,
    report_id: report.id,
    report_title: report.title || '',
    isPublic: report.status === 'Posted',
    location_name: report.location || '',
    report_type: report.report_type || report.tags || [],
    trades_field: report.trades_field || [],
    report_desc: report.content || '',
  });
};

/**
 * Converts ReportData to StoredReport (for saving)
 */
export const reportDataToStoredReport = (
  reportData: ReportData,
  id?: string,
  recordingId?: string
): StoredReport => {
  // Format date and time for display
  const dateStr = reportData.month
    ? `${reportData.month} ${reportData.day}, ${reportData.year}`
    : '';
  const timeStr = reportData.time
    ? `${Math.floor(reportData.time / 100)}:${String(reportData.time % 100).padStart(2, '0')}`
    : '';

  return {
    id: id || reportData.report_id,
    title: reportData.report_title,
    date: dateStr,
    timestamp: timeStr,
    location: reportData.location_name,
    tags: reportData.report_type, // Legacy support
    report_type: reportData.report_type,
    trades_field: reportData.trades_field,
    status: reportData.isPublic ? 'Posted' : 'Private',
    excerpt:
      reportData.report_desc.substring(0, 100) + (reportData.report_desc.length > 100 ? '...' : ''),
    content: reportData.report_desc, // Legacy support
    reportData: reportData,
    recordingId,
  };
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

export const getReportById = async (id: string) => {
  const existing = await loadReports();
  return existing.find((item) => item.id === id);
};

export const getReportByRecordingId = async (recordingId: string) => {
  const existing = await loadReports();
  return existing.find((item) => item.recordingId === recordingId);
};
