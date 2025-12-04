/**
 * Unified report data format based on report_data_format.JSON
 * This is the single source of truth for all report data structures
 */

export type ReportData = {
  isPublic: boolean;
  report_method: string;
  report_id: string;
  report_title: string;
  month: string;
  day: number;
  year: number;
  time: number;
  audio_URI: string;
  audio_duration: number; // in milliseconds
  location_name: string;
  location_coords: [number, number]; // [latitude, longitude]
  report_type: string[];
  trades_field: string[];
  report_desc: string;
  report_transcript: string;
  primaries_involved: string[];
  witnesses: string[];
  actions_taken: string[];
  recommended_actions: string[];
  // Reference data (not stored per report, but used for validation/UI)
  worksafebcViolationTypes?: string[];
  tradeFields?: string[];
};

/**
 * Creates an empty ReportData object with default values
 */
export const createEmptyReportData = (): ReportData => ({
  isPublic: false,
  report_method: '',
  report_id: '',
  report_title: '',
  month: '',
  day: 0,
  year: 0,
  time: 0,
  audio_URI: '',
  audio_duration: 0,
  location_name: '',
  location_coords: [0, 0],
  report_type: [],
  trades_field: [],
  report_desc: '',
  report_transcript: '',
  primaries_involved: [],
  witnesses: [],
  actions_taken: [],
  recommended_actions: [],
});

/**
 * Creates ReportData from a Date object
 */
export const createReportDataFromDate = (date: Date, audioUri?: string): Partial<ReportData> => {
  return {
    month: date.toLocaleDateString('en-US', { month: 'long' }),
    day: date.getDate(),
    year: date.getFullYear(),
    time: date.getHours() * 100 + date.getMinutes(), // Format: HHMM (e.g., 1015 for 10:15)
    audio_URI: audioUri || '',
    report_id: `${date.getTime()}`,
  };
};

/**
 * Merges partial ReportData with defaults
 */
export const mergeReportData = (
  partial: Partial<ReportData>,
  defaults: ReportData = createEmptyReportData()
): ReportData => {
  return {
    ...defaults,
    ...partial,
    location_coords: partial.location_coords || defaults.location_coords,
    report_type: partial.report_type || defaults.report_type,
    trades_field: partial.trades_field || defaults.trades_field,
    primaries_involved: partial.primaries_involved || defaults.primaries_involved,
    witnesses: partial.witnesses || defaults.witnesses,
    actions_taken: partial.actions_taken || defaults.actions_taken,
    recommended_actions: partial.recommended_actions || defaults.recommended_actions,
  };
};

/**
 * Reference data from report_data_format.JSON
 * These are the ONLY valid values for report_type and trades_field
 */
export const WORKSAFEBC_VIOLATION_TYPES = [
  'Verbal Harassment',
  'Physical Harassment',
  'Harassment',
  'Bullying',
  'Sexual Harassment',
  'Threats',
  'Workplace Violence',
  'Horseplay',
  'Discrimination',
  'Intimidation',
  'Lockout',
];

export const TRADE_FIELDS = [
  'Carpentry',
  'Plumbing',
  'Electrical',
  'Welding',
  'HVAC',
  'Masonry',
  'Automotive Service',
  'Heavy Equipment Operator',
  'Pipefitting',
  'Construction Laborer',
];

/**
 * Validates and filters report_type values to only include valid violation types
 */
export const validateReportTypes = (types: string[]): string[] => {
  return types.filter((type) => WORKSAFEBC_VIOLATION_TYPES.includes(type));
};

/**
 * Validates and filters trades_field values to only include valid trade fields
 */
export const validateTradeFields = (fields: string[]): string[] => {
  return fields.filter((field) => TRADE_FIELDS.includes(field));
};
