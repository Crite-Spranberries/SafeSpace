/**
 * WorksafeBC resource links mapped to report types and recommended actions
 */

export const SERIOUS_REPORT_TYPES = [
  'Physical Harassment',
  'Sexual Harassment',
  'Workplace Violence',
  'Threats',
  'Intimidation',
  'Discrimination',
];

/**
 * Maps recommended action keywords to WorksafeBC resource URLs
 */
export const ACTION_TO_RESOURCE_MAP: Record<string, string> = {
  harassment: 'https://www.worksafebc.com/en/health-safety/hazards-exposures/bullying-harassment',
  violence: 'https://www.worksafebc.com/en/health-safety/hazards-exposures/violence',
  discrimination:
    'https://www.worksafebc.com/en/health-safety/hazards-exposures/bullying-harassment',
  safety: 'https://www.worksafebc.com/en/health-safety',
  training: 'https://www.worksafebc.com/en/health-safety/education-training-certification',
  policy: 'https://www.worksafebc.com/en/health-safety/create-manage/program-elements',
  ppe: 'https://www.worksafebc.com/en/health-safety/hazards-exposures/personal-protective-equipment',
  investigation: 'https://www.worksafebc.com/en/health-safety/create-manage/investigate-incidents',
  report: 'https://www.worksafebc.com/en/claims/report-workplace-injury-illness',
  incident: 'https://www.worksafebc.com/en/health-safety/create-manage/investigate-incidents',
  complaint:
    'https://www.worksafebc.com/en/health-safety/claims-prevention/rights-responsibilities',
  legal: 'https://www.worksafebc.com/en/health-safety/claims-prevention/rights-responsibilities',
  rights: 'https://www.worksafebc.com/en/health-safety/claims-prevention/rights-responsibilities',
};

/**
 * Determines if a report is serious enough to warrant WorksafeBC resource links
 */
export const isSeriousReport = (reportTypes: string[]): boolean => {
  if (!reportTypes || reportTypes.length === 0) {
    return false;
  }

  // Case-insensitive matching
  const reportTypesLower = reportTypes.map((type) => type.toLowerCase().trim());
  const seriousTypesLower = SERIOUS_REPORT_TYPES.map((type) => type.toLowerCase().trim());

  const isSerious = reportTypesLower.some((type) => seriousTypesLower.includes(type));

  console.log('isSeriousReport check:', {
    reportTypes,
    isSerious,
  });

  return isSerious;
};

/**
 * Finds a WorksafeBC resource link for a recommended action
 * Returns the URL if a match is found, otherwise null
 */
export const getResourceLinkForAction = (action: string): string | null => {
  const actionLower = action.toLowerCase().trim();

  // Check for keyword matches (more flexible matching)
  for (const [keyword, url] of Object.entries(ACTION_TO_RESOURCE_MAP)) {
    // Check if keyword appears as a whole word or as part of the action
    const keywordRegex = new RegExp(`\\b${keyword}\\w*`, 'i');
    if (keywordRegex.test(actionLower)) {
      console.log(`Matched keyword "${keyword}" for action: "${action}"`);
      return url;
    }
  }

  console.log(`No keyword match found for action: "${action}"`);
  return null;
};

/**
 * Default WorksafeBC resource URL for serious reports
 */
const DEFAULT_WORKSAFEBC_URL = 'https://www.worksafebc.com/en/health-safety';

/**
 * Gets all resource links for a set of recommended actions
 * ALL reports will get links - at least 1-2 actions will have WorksafeBC resource links
 */
export const getResourceLinksForActions = (
  actions: string[],
  reportTypes: string[]
): Array<{ action: string; link: string | null }> => {
  console.log('getResourceLinksForActions called:', {
    actions,
    reportTypes,
    actionsLength: actions?.length,
    reportTypesLength: reportTypes?.length,
  });

  if (!actions || actions.length === 0) {
    console.log('No actions provided');
    return [];
  }

  const isSerious = isSeriousReport(reportTypes);
  console.log('Report is serious:', isSerious);

  // For all reports, try to find specific links for each action
  const actionsWithLinks = actions.map((action) => {
    const specificLink = getResourceLinkForAction(action);
    return { action, link: specificLink };
  });

  // Count how many actions have links
  const linksCount = actionsWithLinks.filter((item) => item.link !== null).length;
  console.log(`Found ${linksCount} specific links out of ${actions.length} actions`);

  // If we have fewer than 2 links, add default links to actions that don't have them
  // Prioritize the first actions to ensure at least 1-2 have links
  const result = actionsWithLinks.map((item, index) => {
    // If this action doesn't have a link and we need more links
    if (!item.link && (linksCount < 2 || index < 2)) {
      // Use default WorksafeBC URL
      console.log(`Adding default link to action "${item.action}" (index ${index})`);
      return { ...item, link: DEFAULT_WORKSAFEBC_URL };
    }
    return item;
  });

  // Final check: ensure at least the first action has a link
  if (result.length > 0 && !result[0].link) {
    result[0].link = DEFAULT_WORKSAFEBC_URL;
    console.log('Ensuring first action has a link');
  }

  console.log('Final actions with links:', result);

  return result;
};
