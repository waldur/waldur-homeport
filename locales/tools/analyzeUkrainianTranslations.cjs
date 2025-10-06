'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Ukrainian Translation Quality Analysis
 *
 * Analyzes Ukrainian translations against enhanced context to identify improvement opportunities
 * Focuses on Ukrainian language-specific grammar, style, and cultural adaptation
 */

class UkrainianTranslationAnalyzer {
  constructor() {
    this.enhancedTemplate = {};
    this.ukrainianTranslations = {};
    this.issues = [];
    this.recommendations = [];
  }

  // Load enhanced template and Ukrainian translations
  loadData() {
    try {
      const rootDir = path.join(__dirname, '../../');
      const enhancedContent = fs.readFileSync(
        path.join(rootDir, 'template.json'),
        'utf8',
      );
      this.enhancedTemplate = JSON.parse(enhancedContent);

      const ukrainianContent = fs.readFileSync(
        path.join(rootDir, 'locales/uk.json'),
        'utf8',
      );
      this.ukrainianTranslations = JSON.parse(ukrainianContent);

      console.log(
        `📚 Loaded ${Object.keys(this.enhancedTemplate).length} enhanced template entries`,
      );
      console.log(
        `🇺🇦 Loaded ${Object.keys(this.ukrainianTranslations).length} Ukrainian translations`,
      );
    } catch (error) {
      console.error(`Error loading data: ${error.message}`);
      process.exit(1);
    }
  }

  // Check if Ukrainian translation follows button text conventions
  analyzeButtonTranslations() {
    const buttonIssues = [];

    for (const [english, templateData] of Object.entries(
      this.enhancedTemplate,
    )) {
      const ukrainian = this.ukrainianTranslations[english];
      if (!ukrainian) continue;

      const context = templateData.context;
      if (
        context &&
        context.primary_ui_type &&
        context.primary_ui_type.includes('button')
      ) {
        const issues = this.checkButtonTextQuality(english, ukrainian, context);
        if (issues.length > 0) {
          buttonIssues.push({
            english,
            ukrainian,
            context: context.primary_ui_type,
            issues,
            locations: templateData.description,
          });
        }
      }
    }

    return buttonIssues;
  }

  // Check button text quality for Ukrainian
  checkButtonTextQuality(english, ukrainian, context) {
    const issues = [];

    // Check length - Ukrainian tends to be longer than English
    if (ukrainian.length > english.length * 3.5) {
      issues.push({
        type: 'length_concern',
        message: `Ukrainian text significantly longer than English (${ukrainian.length} vs ${english.length} chars)`,
        severity: 'medium',
      });
    }

    // Check for appropriate verb forms in action buttons (Ukrainian infinitive or imperative)
    if (
      context.primary_ui_type === 'submit_button' ||
      context.primary_ui_type === 'action_button'
    ) {
      if (!this.hasAppropriateUkrainianVerb(english, ukrainian)) {
        issues.push({
          type: 'verb_form',
          message:
            'Consider using Ukrainian infinitive (-ти/-ть) or imperative verb form for action buttons',
          severity: 'low',
        });
      }
    }

    // Check for case consistency (Ukrainian has 7 cases)
    if (this.hasInconsistentUkrainianCase(ukrainian)) {
      issues.push({
        type: 'case_consistency',
        message:
          'Check Ukrainian case usage - ensure consistency with grammatical context',
        severity: 'medium',
      });
    }

    // Check for gender agreement issues (3 genders)
    if (this.hasGenderAgreementIssues(ukrainian)) {
      issues.push({
        type: 'gender_agreement',
        message:
          'Check Ukrainian gender agreement (masculine, feminine, neuter)',
        severity: 'medium',
      });
    }

    // Check for proper Cyrillic character usage
    if (this.missingUkrainianSpecificChars(english, ukrainian)) {
      issues.push({
        type: 'cyrillic_chars',
        message: 'Check Ukrainian-specific Cyrillic characters (ґ, є, і, ї)',
        severity: 'high',
      });
    }

    // Check for apostrophe usage (м\'який знак)
    if (this.hasIncorrectApostropheUsage(ukrainian)) {
      issues.push({
        type: 'apostrophe_usage',
        message:
          "Check Ukrainian apostrophe usage (м'який знак) before я, ю, є, ї",
        severity: 'medium',
      });
    }

    return issues;
  }

  // Check variable handling in Ukrainian translations
  analyzeVariableHandling() {
    const variableIssues = [];

    for (const [english, templateData] of Object.entries(
      this.enhancedTemplate,
    )) {
      const ukrainian = this.ukrainianTranslations[english];
      if (!ukrainian) continue;

      const context = templateData.context;
      if (context && context.variables) {
        const issues = this.checkUkrainianVariableHandling(
          english,
          ukrainian,
          context.variables,
        );
        if (issues.length > 0) {
          variableIssues.push({
            english,
            ukrainian,
            variables: context.variables,
            issues,
            locations: templateData.description,
          });
        }
      }
    }

    return variableIssues;
  }

  // Check Ukrainian variable handling (cases, gender agreement, etc.)
  checkUkrainianVariableHandling(english, ukrainian, variables) {
    const issues = [];

    // Check for number-noun agreement issues
    for (const [varName, varInfo] of Object.entries(variables)) {
      if (varInfo.type === 'number') {
        if (!this.hasProperUkrainianNumberAgreement(ukrainian, varName)) {
          issues.push({
            type: 'number_agreement',
            variable: varName,
            message:
              'Ukrainian number-noun agreement may need attention (1, 2-4, 5+ forms)',
            severity: 'high',
          });
        }
      }

      // Check for proper case usage with variables
      if (
        varInfo.type === 'string' &&
        this.needsUkrainianCaseAdjustment(ukrainian, varName)
      ) {
        issues.push({
          type: 'case_adjustment',
          variable: varName,
          message:
            'Variable may need Ukrainian case inflection in grammatical context',
          severity: 'medium',
        });
      }

      // Check for gender agreement with variables
      if (this.needsUkrainianGenderAgreement(ukrainian, varName)) {
        issues.push({
          type: 'gender_agreement',
          variable: varName,
          message: 'Variable may need gender agreement in Ukrainian context',
          severity: 'medium',
        });
      }
    }

    return issues;
  }

  // Analyze titles and headings
  analyzeTitleTranslations() {
    const titleIssues = [];

    for (const [english, templateData] of Object.entries(
      this.enhancedTemplate,
    )) {
      const ukrainian = this.ukrainianTranslations[english];
      if (!ukrainian) continue;

      const context = templateData.context;
      if (context && context.primary_ui_type === 'title') {
        const issues = this.checkUkrainianTitle(english, ukrainian);
        if (issues.length > 0) {
          titleIssues.push({
            english,
            ukrainian,
            issues,
            locations: templateData.description,
          });
        }
      }
    }

    return titleIssues;
  }

  // Check Ukrainian title quality
  checkUkrainianTitle(english, ukrainian) {
    const issues = [];

    // Check capitalization (Ukrainian uses sentence case)
    if (this.hasInappropriateUkrainianCapitalization(ukrainian)) {
      issues.push({
        type: 'capitalization',
        message: 'Ukrainian titles typically use sentence case, not title case',
        severity: 'low',
      });
    }

    // Check for appropriate Ukrainian terminology
    if (this.shouldUseNativeUkrainianTerms(english, ukrainian)) {
      issues.push({
        type: 'terminology',
        message:
          'Consider using native Ukrainian terminology instead of Russian loanwords',
        severity: 'high',
      });
    }

    return issues;
  }

  // Ukrainian-specific helper methods
  hasAppropriateUkrainianVerb(english, ukrainian) {
    // Check for Ukrainian infinitive forms (-ти, -ть) or imperative mood
    const ukrainianVerbPatterns = [
      /ти$/,
      /ть$/,
      /ати$/,
      /ити$/, // infinitive endings
      /й$/,
      /йте$/,
      /и$/, // imperative forms
    ];

    const actionWords = [
      'add',
      'save',
      'delete',
      'create',
      'update',
      'send',
      'cancel',
    ];
    if (actionWords.some((word) => english.toLowerCase().includes(word))) {
      return ukrainianVerbPatterns.some((pattern) =>
        pattern.test(ukrainian.toLowerCase()),
      );
    }

    return true; // Default to OK if not an action word
  }

  hasInconsistentUkrainianCase(ukrainian) {
    // Basic check for potential case inconsistencies
    // Check for inappropriate mixing of different case patterns
    return ukrainian.includes('_') || ukrainian.match(/[А-ЯҐЄІЇ]{3,}/);
  }

  hasGenderAgreementIssues(ukrainian) {
    // Check for potential gender agreement issues
    const mismatchPatterns = [
      /ий\s+[аяеіє]/i, // masculine adjective with feminine/neuter ending
      /а\s+[ийео]/i, // feminine ending with masculine/neuter modifier
      /е\s+[айиі]/i, // neuter ending with masculine/feminine modifier
    ];

    return mismatchPatterns.some((pattern) => pattern.test(ukrainian));
  }

  missingUkrainianSpecificChars(english, ukrainian) {
    // Check if Ukrainian text might be missing specific Ukrainian Cyrillic characters
    const suspiciousPatterns = [
      /г(?![аеиіоуєї])/i, // 'г' that should probably be 'ґ'
      /е(?=\s)/i, // 'е' at word end that might be 'є'
      /и(?=[аеєіїоуй])/i, // 'и' before vowels that might be 'і'
    ];

    // Also check for Russian characters that shouldn't be in Ukrainian
    const russianChars = /[ыё]/i;

    return (
      suspiciousPatterns.some((pattern) => pattern.test(ukrainian)) ||
      russianChars.test(ukrainian)
    );
  }

  hasIncorrectApostropheUsage(ukrainian) {
    // Check for missing apostrophes before я, ю, є, ї after consonants
    const needsApostrophe = /[бвгджзклмнпрстфхцчшщ][яюєї]/i;
    const hasApostrophe = /[бвгджзклмнпрстфхцчшщ]'[яюєї]/i;

    return needsApostrophe.test(ukrainian) && !hasApostrophe.test(ukrainian);
  }

  hasProperUkrainianNumberAgreement(ukrainian, varName) {
    // Check for Ukrainian number agreement (1, 2-4, 5+)
    const numberVar = `{${varName}}`;
    if (ukrainian.includes(numberVar)) {
      // Ukrainian has different forms for 1, 2-4, and 5+
      return !ukrainian.match(new RegExp(`${numberVar}\\s+\\w+[^аиіві]$`));
    }
    return true;
  }

  needsUkrainianCaseAdjustment(ukrainian, varName) {
    const variablePattern = `{${varName}}`;
    // Check if variable appears in context that requires specific case
    const caseRequiringContexts = [
      /\s(з|без|до|від|на|в|за|для|після|перед|через)\s/, // prepositions requiring specific cases
      /\s(біля|коло|під|над|між|серед)\s/, // more prepositions
    ];

    return (
      ukrainian.includes(variablePattern) &&
      caseRequiringContexts.some((pattern) => pattern.test(ukrainian))
    );
  }

  needsUkrainianGenderAgreement(ukrainian, varName) {
    const variablePattern = `{${varName}}`;
    // Check if variable appears with adjectives that need gender agreement
    return (
      ukrainian.includes(variablePattern) &&
      ukrainian.match(/\s(новий|старий|добрий|поганий|великий|малий)\s/)
    );
  }

  hasInappropriateUkrainianCapitalization(ukrainian) {
    // Check for English-style title case in Ukrainian
    const words = ukrainian.split(' ');
    if (words.length > 1) {
      // Count capitalized words (excluding first word)
      const capitalizedCount = words
        .slice(1)
        .filter(
          (word) => word.length > 2 && word[0] === word[0].toUpperCase(),
        ).length;
      return capitalizedCount > 1; // More than 1 capitalized word suggests title case
    }
    return false;
  }

  shouldUseNativeUkrainianTerms(english, ukrainian) {
    // Check for Russian loanwords that should be replaced with Ukrainian terms
    const russianTerms = ['компютер', 'интернет', 'емейл', 'файл', 'папка'];

    // Also check for other Russianisms
    const russianisms = /\b(аж|або|чи|поки|хоча|проте)\b/i;

    return (
      russianTerms.some((term) => ukrainian.toLowerCase().includes(term)) ||
      russianisms.test(ukrainian)
    );
  }

  // Generate improvement recommendations
  generateRecommendations() {
    return [
      '• Use Ukrainian sentence case for titles instead of English title case',
      '• Prefer native Ukrainian terms over Russian loanwords and Russianisms',
      '• Use infinitive (-ти/-ть) or imperative forms for action buttons',
      '• Pay attention to Ukrainian case agreement with variables (7 cases)',
      '• Include polite language markers in error messages (будь ласка, вибачте)',
      '• Ensure proper gender agreement (masculine, feminine, neuter)',
      '• Use Ukrainian-specific Cyrillic characters (ґ, є, і, ї) correctly',
      "• Apply apostrophe rules correctly (м'який знак) before я, ю, є, ї",
      '• Check number agreement including special forms for 1, 2-4, 5+',
      '• Use formal "ви" form in professional contexts',
      '• Consider verb aspect usage (perfective/imperfective) for proper meaning',
      '• Avoid Russian characters (ы, ё) and Russianisms in Ukrainian text',
    ];
  }

  // Main analysis function
  analyze() {
    console.log('🔍 Starting Ukrainian translation analysis...\n');

    this.loadData();

    console.log('🔘 Analyzing button translations...');
    const buttonIssues = this.analyzeButtonTranslations();

    console.log('🔢 Analyzing variable handling...');
    const variableIssues = this.analyzeVariableHandling();

    console.log('📝 Analyzing titles and headings...');
    const titleIssues = this.analyzeTitleTranslations();

    // Generate report
    this.generateReport(buttonIssues, variableIssues, titleIssues);
  }

  // Generate comprehensive report
  generateReport(buttonIssues, variableIssues, titleIssues) {
    const totalIssues =
      buttonIssues.length + variableIssues.length + titleIssues.length;

    console.log('\n📊 UKRAINIAN TRANSLATION ANALYSIS REPORT');
    console.log('==================================================');
    console.log(`Total improvement opportunities found: ${totalIssues}\n`);

    // Button issues
    if (buttonIssues.length > 0) {
      console.log(`🔘 BUTTON TRANSLATION ISSUES (${buttonIssues.length})`);
      console.log('------------------------------');
      buttonIssues.slice(0, 5).forEach((item, index) => {
        console.log(`${index + 1}. "${item.english}" → "${item.ukrainian}"`);
        console.log(`   Context: ${item.context}`);
        item.issues.forEach((issue) => {
          console.log(`   ⚠️  ${issue.message}`);
        });
        console.log('');
      });
      if (buttonIssues.length > 5) {
        console.log(
          `   ... and ${buttonIssues.length - 5} more button issues\n`,
        );
      }
    }

    // Variable issues
    if (variableIssues.length > 0) {
      console.log(`🔢 VARIABLE HANDLING ISSUES (${variableIssues.length})`);
      console.log('------------------------------');
      variableIssues.slice(0, 5).forEach((item, index) => {
        console.log(`${index + 1}. "${item.english}" → "${item.ukrainian}"`);
        console.log(`   Variables: ${Object.keys(item.variables).join(', ')}`);
        item.issues.forEach((issue) => {
          console.log(`   ⚠️  ${issue.message}`);
        });
        console.log('');
      });
      if (variableIssues.length > 5) {
        console.log(
          `   ... and ${variableIssues.length - 5} more variable issues\n`,
        );
      }
    }

    // Title issues
    if (titleIssues.length > 0) {
      console.log(`📝 TITLE TRANSLATION ISSUES (${titleIssues.length})`);
      console.log('------------------------------');
      titleIssues.slice(0, 5).forEach((item, index) => {
        console.log(`${index + 1}. "${item.english}" → "${item.ukrainian}"`);
        console.log(`   Context: title`);
        item.issues.forEach((issue) => {
          console.log(`   ⚠️  ${issue.message}`);
        });
        console.log('');
      });
      if (titleIssues.length > 5) {
        console.log(`   ... and ${titleIssues.length - 5} more title issues\n`);
      }
    }

    // Recommendations
    console.log('💡 IMPROVEMENT RECOMMENDATIONS');
    console.log('========================================');
    this.generateRecommendations().forEach((rec) => console.log(rec));

    console.log('\n🎯 PRIORITY ACTIONS:');
    console.log(
      '1. Focus on replacing Russian loanwords with Ukrainian alternatives',
    );
    console.log('2. Review case agreement and gender agreement issues');
    console.log(
      '3. Ensure proper Ukrainian-specific Cyrillic characters usage',
    );
    console.log("4. Check apostrophe usage rules (м'який знак)");
    console.log('5. Review number agreement including 1, 2-4, 5+ forms');
  }
}

// Run the analysis
if (require.main === module) {
  const analyzer = new UkrainianTranslationAnalyzer();
  analyzer.analyze();
}

module.exports = UkrainianTranslationAnalyzer;
