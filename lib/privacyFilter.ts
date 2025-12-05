/**
 * Privacy filter for public reports
 * Removes or anonymizes names and identifying information from report descriptions
 */

/**
 * Detects and replaces names in text with generic identifiers
 * Uses primaries_involved field when available, otherwise uses heuristics
 */
export function filterNamesFromText(text: string, primariesInvolved?: string[]): string {
  if (!text || text.trim().length === 0) {
    return text;
  }

  let filteredText = text;

  // If we have primaries_involved, use those specific names
  if (primariesInvolved && primariesInvolved.length > 0) {
    const nameMap = new Map<string, string>();
    let individualCounter = 0;

    // First pass: identify names and assign generic identifiers
    primariesInvolved.forEach((name) => {
      const cleanName = name.trim();
      // Skip if empty, already processed, or looks like a role/title rather than a name
      if (
        cleanName.length > 0 &&
        !nameMap.has(cleanName) &&
        !cleanName.match(/^(Supervisor|Manager|Colleague|Coworker|Worker|Employee|Employer)$/i)
      ) {
        const identifier = `Individual ${String.fromCharCode(65 + individualCounter)}`; // A, B, C, etc.
        nameMap.set(cleanName, identifier);
        individualCounter++;
      }
    });

    // Replace names in text (case-insensitive, whole word matches)
    nameMap.forEach((replacement, name) => {
      // Create regex to match the name as a whole word (case-insensitive)
      // Escape special regex characters in the name
      const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const nameRegex = new RegExp(`\\b${escapedName}\\b`, 'gi');
      filteredText = filteredText.replace(nameRegex, replacement);
    });
  } else {
    // If no primaries_involved, try to detect potential names using heuristics
    // Look for capitalized words that might be names (2+ characters, not common words)
    const commonWords = new Set([
      'The',
      'This',
      'That',
      'These',
      'Those',
      'They',
      'Their',
      'There',
      'Then',
      'Than',
      'When',
      'Where',
      'What',
      'Which',
      'Who',
      'Why',
      'How',
      'Supervisor',
      'Manager',
      'Colleague',
      'Coworker',
      'Worker',
      'Employee',
      'Employer',
      'Company',
      'Site',
      'Location',
      'Building',
      'Office',
      'Meeting',
      'Training',
      'Project',
      'Task',
      'Work',
      'Job',
      'Position',
      'Department',
      'Team',
      'Group',
      'Organization',
      'Male',
      'Female',
      'Individual',
    ]);

    // Find potential names (capitalized words that aren't common words and aren't at sentence start)
    const sentences = filteredText.split(/([.!?]\s+)/);
    const nameMap = new Map<string, string>();
    let individualCounter = 0;

    sentences.forEach((sentence) => {
      const words = sentence.split(/(\s+|[.,!?;:])/);
      for (let i = 1; i < words.length; i++) {
        const word = words[i].trim();
        // Check if it's a capitalized word (starts with uppercase, rest lowercase)
        if (
          word.length >= 2 &&
          /^[A-Z][a-z]+$/.test(word) &&
          !commonWords.has(word) &&
          !word.match(/^[A-Z][a-z]+'s$/) && // Exclude possessives like "John's"
          words[i - 1] && // Has previous word
          !words[i - 1].trim().match(/[.!?]$/) // Previous word doesn't end sentence
        ) {
          if (!nameMap.has(word)) {
            const identifier = `Individual ${String.fromCharCode(65 + individualCounter)}`;
            nameMap.set(word, identifier);
            individualCounter++;
          }
        }
      }
    });

    // Replace detected names
    nameMap.forEach((replacement, name) => {
      const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const nameRegex = new RegExp(`\\b${escapedName}\\b`, 'g');
      filteredText = filteredText.replace(nameRegex, replacement);
    });
  }

  return filteredText;
}

/**
 * Filters a report's description for public display
 */
export function filterReportForPublic(reportDesc: string, primariesInvolved?: string[]): string {
  return filterNamesFromText(reportDesc, primariesInvolved);
}

/**
 * Filters recommended actions array for public display (removes names)
 */
export function filterRecommendedActionsForPublic(
  actions: string[],
  primariesInvolved?: string[]
): string[] {
  if (!actions || actions.length === 0) {
    return actions;
  }

  return actions.map((action) => filterNamesFromText(action, primariesInvolved));
}
