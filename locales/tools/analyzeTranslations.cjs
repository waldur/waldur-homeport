'use strict';

const fs = require('fs');
const path = require('path');

/**
 * AnalyzeTranslations Tool
 *
 * Compares provided translations with current file content and identifies
 * specific differences, issues, and translations that actually need changes
 */

class AnalyzeTranslations {
  constructor(language = 'ru') {
    this.language = language;
    this.localeFile = path.join(__dirname, `../locales/${language}.json`);
    this.templateFile = path.join(__dirname, '../../template.json');
  }

  /**
   * Compare provided translations with current file and identify changes needed
   * @param {Object} proposedTranslations - Object with key-value pairs of proposed translations
   * @returns {Object} Analysis results with changes needed, issues found, etc.
   */
  analyzeChanges(proposedTranslations) {
    if (!fs.existsSync(this.localeFile)) {
      throw new Error(`Locale file not found: ${this.localeFile}`);
    }

    const currentContent = fs.readFileSync(this.localeFile, 'utf8');
    let currentTranslations = {};

    try {
      currentTranslations = JSON.parse(currentContent);
    } catch (error) {
      throw new Error(`Error parsing current locale file: ${error.message}`);
    }

    const analysis = {
      needsChanges: {}, // Translations that actually need updating
      noChangesNeeded: {}, // Translations that are already good
      newTranslations: {}, // Missing keys to be added
      invalidKeys: [], // Keys that don't exist in template
      issues: [], // Quality issues found
      summary: {},
    };

    // Load template for validation
    let template = {};
    if (fs.existsSync(this.templateFile)) {
      try {
        template = JSON.parse(fs.readFileSync(this.templateFile, 'utf8'));
      } catch {
        console.warn('Could not load template.json for validation');
      }
    }

    for (const [key, proposedValue] of Object.entries(proposedTranslations)) {
      // Skip if proposed value is a placeholder
      if (
        proposedValue === '[MISSING - ADD TRANSLATION]' ||
        proposedValue === '[MISSING]'
      ) {
        if (!currentTranslations.hasOwnProperty(key)) {
          analysis.issues.push(
            `Missing translation for "${key}" - needs manual translation`,
          );
        }
        continue;
      }

      // Check if key exists in template
      if (Object.keys(template).length > 0 && !template.hasOwnProperty(key)) {
        analysis.invalidKeys.push(key);
        continue;
      }

      const currentValue = currentTranslations[key];

      if (!currentTranslations.hasOwnProperty(key)) {
        // New translation to be added
        analysis.newTranslations[key] = proposedValue;
      } else if (currentValue !== proposedValue) {
        // Translation needs updating
        const issue = this.identifyIssue(
          key,
          currentValue,
          proposedValue,
          template[key],
        );
        analysis.needsChanges[key] = {
          current: currentValue,
          proposed: proposedValue,
          reason: issue,
        };
      } else {
        // Translation is already correct
        analysis.noChangesNeeded[key] = currentValue;
      }
    }

    // Generate summary
    analysis.summary = {
      totalAnalyzed: Object.keys(proposedTranslations).length,
      changesNeeded: Object.keys(analysis.needsChanges).length,
      newTranslations: Object.keys(analysis.newTranslations).length,
      noChangesNeeded: Object.keys(analysis.noChangesNeeded).length,
      invalidKeys: analysis.invalidKeys.length,
      issuesFound: analysis.issues.length,
    };

    return analysis;
  }

  /**
   * Identify the specific issue with a translation
   * @param {string} key - Translation key
   * @param {string} current - Current translation
   * @param {string} proposed - Proposed translation
   * @param {Object} templateData - Template data for context
   * @returns {string} Description of the issue
   */
  identifyIssue(key, current, proposed, templateData) {
    const issues = [];

    // Check for obvious problems
    if (!current || current.trim() === '') {
      issues.push('empty translation');
    }

    if (current === key) {
      issues.push('untranslated (same as English)');
    }

    if (current.length < 2) {
      issues.push('too short');
    }

    if (/^[a-zA-Z\s]+$/.test(current) && key !== current) {
      // Might be English text
      const englishWords = [
        'the',
        'and',
        'or',
        'in',
        'on',
        'at',
        'to',
        'for',
        'of',
        'with',
        'by',
      ];
      if (englishWords.some((word) => current.toLowerCase().includes(word))) {
        issues.push('appears to be English text');
      }
    }

    // Context-specific issues
    if (templateData?.context?.primary_ui_type) {
      const uiType = templateData.context.primary_ui_type;

      if (uiType.includes('button') && current.length > 20) {
        issues.push('too long for button text');
      }

      if (
        uiType.includes('error') &&
        !current.includes('.') &&
        current.length > 10
      ) {
        issues.push('error message should be complete sentence');
      }
    }

    // Language-specific checks
    const languageIssues = this.checkLanguageSpecificIssues(current, proposed);
    issues.push(...languageIssues);

    return issues.length > 0 ? issues.join(', ') : 'quality improvement';
  }

  /**
   * Check for language-specific translation issues
   * @param {string} current - Current translation
   * @param {string} proposed - Proposed translation
   * @returns {string[]} Array of language-specific issues
   */
  checkLanguageSpecificIssues(current, proposed) {
    const issues = [];

    switch (this.language) {
      case 'ru':
        // Russian-specific checks
        if (
          current.includes('перезаряжать') &&
          proposed.includes('перезагрузить')
        ) {
          issues.push(
            'incorrect verb form (reload should be перезагрузить, not перезаряжать)',
          );
        }
        break;

      case 'et':
        // Estonian-specific checks
        if (
          current.includes(' ') &&
          !proposed.includes(' ') &&
          proposed.length > current.length
        ) {
          issues.push('Estonian compound word construction preferred');
        }
        break;

      case 'nb':
        // Norwegian-specific checks
        if (
          current.includes(' ') &&
          !proposed.includes(' ') &&
          proposed.length > current.length
        ) {
          issues.push('Norwegian compound word construction preferred');
        }
        break;
    }

    return issues;
  }

  /**
   * Get only the translations that actually need changes
   * @param {Object} proposedTranslations - Proposed translations
   * @returns {Object} Only the translations that need updating
   */
  getChangesOnly(proposedTranslations) {
    const analysis = this.analyzeChanges(proposedTranslations);
    return {
      ...analysis.needsChanges,
      ...analysis.newTranslations,
    };
  }

  /**
   * Validate that all keys exist in the locale file or template
   * @param {string[]} keys - Array of keys to validate
   * @returns {Object} Validation results
   */
  validateKeys(keys) {
    const results = {
      valid: [],
      invalid: [],
      missing: [],
    };

    // Check against template first
    let template = {};
    if (fs.existsSync(this.templateFile)) {
      try {
        template = JSON.parse(fs.readFileSync(this.templateFile, 'utf8'));
      } catch {
        console.warn('Could not load template.json for validation');
      }
    }

    // Check against current locale file
    let currentTranslations = {};
    if (fs.existsSync(this.localeFile)) {
      try {
        const content = fs.readFileSync(this.localeFile, 'utf8');
        currentTranslations = JSON.parse(content);
      } catch {
        console.warn('Could not load current locale file for validation');
      }
    }

    for (const key of keys) {
      if (Object.keys(template).length > 0) {
        if (template.hasOwnProperty(key)) {
          results.valid.push(key);
          if (!currentTranslations.hasOwnProperty(key)) {
            results.missing.push(key);
          }
        } else {
          results.invalid.push(key);
        }
      } else {
        // Fallback: check against current locale file
        if (currentTranslations.hasOwnProperty(key)) {
          results.valid.push(key);
        } else {
          results.missing.push(key);
        }
      }
    }

    return results;
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  const language = args[1] || 'ru';

  const analyzer = new AnalyzeTranslations(language);

  try {
    switch (command) {
      case 'analyze-file':
        const inputFile = args[2];
        if (!inputFile || !fs.existsSync(inputFile)) {
          console.error(
            'Usage: node analyzeTranslations.cjs analyze-file <language> <input.json>',
          );
          process.exit(1);
        }
        const proposedTranslations = JSON.parse(
          fs.readFileSync(inputFile, 'utf8'),
        );
        const analysis = analyzer.analyzeChanges(proposedTranslations);
        console.log(JSON.stringify(analysis, null, 2));
        break;

      case 'changes-only':
        const inputFile2 = args[2];
        if (!inputFile2 || !fs.existsSync(inputFile2)) {
          console.error(
            'Usage: node analyzeTranslations.cjs changes-only <language> <input.json>',
          );
          process.exit(1);
        }
        const proposedTranslations2 = JSON.parse(
          fs.readFileSync(inputFile2, 'utf8'),
        );
        const changesOnly = analyzer.getChangesOnly(proposedTranslations2);
        console.log(JSON.stringify(changesOnly, null, 2));
        break;

      case 'validate-keys':
        const keys = args.slice(2);
        if (keys.length === 0) {
          console.error(
            'Usage: node analyzeTranslations.cjs validate-keys <language> <key1> <key2> ...',
          );
          process.exit(1);
        }
        const validation = analyzer.validateKeys(keys);
        console.log(JSON.stringify(validation, null, 2));
        break;

      default:
        console.log('Available commands:');
        console.log(
          '  analyze-file <language> <input.json>      - Analyze proposed translations',
        );
        console.log(
          '  changes-only <language> <input.json>      - Get only translations that need changes',
        );
        console.log(
          '  validate-keys <language> <key1> <key2>... - Validate translation keys',
        );
        break;
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

module.exports = AnalyzeTranslations;
