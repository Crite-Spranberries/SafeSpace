interface ReportData {
  isPublic: boolean;
  report_method: string;
  report_id: string;
  report_title: string;
  month: string;
  day: number;
  year: number;
  time: number;
  audio_URI: string;
  audio_duration: number;
  location_name: string;
  location_coords: [number, number];
  report_type: string[];
  trades_field: string[];
  report_desc: string;
  primaries_involved: string[];
  witnesses: string[];
  actions_taken: string[];
  recommended_actions: string[];
  worksafebcViolationTypes: [
    'Harassment',
    'Bullying',
    'Sexual Harassment',
    'Threats',
    'Workplace Violence',
    'Horseplay',
    'Discrimination',
    'Intimidation',
    'Fall Protection',
    'Lockout',
    'Safety Gear',
  ];
  tradeFields: [
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
}
