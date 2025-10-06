'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Polish Translation Quality Analysis
 *
 * Analyzes Polish translations against enhanced context to identify improvement opportunities
 * Focuses on Polish language-specific grammar, style, and cultural adaptation
 */

class PolishTranslationAnalyzer {
  constructor() {
    this.enhancedTemplate = {};
    this.polishTranslations = {};
    this.issues = [];
    this.recommendations = [];
  }

  // Load enhanced template and Polish translations
  loadData() {
    try {
      const rootDir = path.join(__dirname, '../../');
      const enhancedContent = fs.readFileSync(
        path.join(rootDir, 'template.json'),
        'utf8',
      );
      this.enhancedTemplate = JSON.parse(enhancedContent);

      const polishContent = fs.readFileSync(
        path.join(rootDir, 'locales/pl.json'),
        'utf8',
      );
      this.polishTranslations = JSON.parse(polishContent);

      console.log(
        `📚 Loaded ${Object.keys(this.enhancedTemplate).length} enhanced template entries`,
      );
      console.log(
        `🇵🇱 Loaded ${Object.keys(this.polishTranslations).length} Polish translations`,
      );
    } catch (error) {
      console.error(`Error loading data: ${error.message}`);
      process.exit(1);
    }
  }

  // Check if Polish translation follows button text conventions
  analyzeButtonTranslations() {
    const buttonIssues = [];

    for (const [english, templateData] of Object.entries(
      this.enhancedTemplate,
    )) {
      const polish = this.polishTranslations[english];
      if (!polish) continue;

      const context = templateData.context;
      if (
        context &&
        context.primary_ui_type &&
        context.primary_ui_type.includes('button')
      ) {
        const issues = this.checkButtonTextQuality(english, polish, context);
        if (issues.length > 0) {
          buttonIssues.push({
            english,
            polish,
            context: context.primary_ui_type,
            issues,
            locations: templateData.description,
          });
        }
      }
    }

    return buttonIssues;
  }

  // Check button text quality for Polish
  checkButtonTextQuality(english, polish, context) {
    const issues = [];

    // Check length - Polish tends to be longer than English
    if (polish.length > english.length * 2.8) {
      issues.push({
        type: 'length_concern',
        message: `Polish text significantly longer than English (${polish.length} vs ${english.length} chars)`,
        severity: 'medium',
      });
    }

    // Check for appropriate verb forms in action buttons (Polish imperative)
    if (
      context.primary_ui_type === 'submit_button' ||
      context.primary_ui_type === 'action_button'
    ) {
      if (!this.hasAppropriatePolishVerb(english, polish)) {
        issues.push({
          type: 'verb_form',
          message:
            'Consider using Polish imperative verb form for action buttons',
          severity: 'low',
        });
      }
    }

    // Check for formal/informal address consistency
    if (this.hasInconsistentPolishFormality(polish)) {
      issues.push({
        type: 'formality_consistency',
        message:
          'Check Pan/Pani/ty consistency - use formal address in professional contexts',
        severity: 'high',
      });
    }

    // Check gender agreement (3 genders in Polish)
    if (!this.hasProperPolishGenderAgreement(polish)) {
      issues.push({
        type: 'gender_agreement',
        message: 'Check masculine/feminine/neuter gender agreement in Polish',
        severity: 'high',
      });
    }

    // Check case usage (7 cases in Polish)
    if (!this.hasProperPolishCaseUsage(polish)) {
      issues.push({
        type: 'case_usage',
        message:
          'Check Polish case usage (nominative, genitive, dative, accusative, instrumental, locative, vocative)',
        severity: 'high',
      });
    }

    // Check aspect usage (perfective/imperfective)
    if (this.needsPolishAspectCheck(english, polish)) {
      issues.push({
        type: 'aspect_usage',
        message:
          'Consider Polish verb aspect (perfective/imperfective) appropriateness',
        severity: 'medium',
      });
    }

    // Check for proper diacritical marks
    if (this.hasMissingPolishDiacritics(polish)) {
      issues.push({
        type: 'diacritical_marks',
        message:
          'Check for missing diacritical marks (ą, ć, ę, ł, ń, ó, ś, ź, ż)',
        severity: 'medium',
      });
    }

    // Check consonant clusters
    if (this.hasImproperConsonantClusters(polish)) {
      issues.push({
        type: 'consonant_clusters',
        message: 'Check Polish consonant cluster correctness',
        severity: 'low',
      });
    }

    return issues;
  }

  // Check variable handling in Polish translations
  analyzeVariableHandling() {
    const variableIssues = [];

    for (const [english, templateData] of Object.entries(
      this.enhancedTemplate,
    )) {
      const polish = this.polishTranslations[english];
      if (!polish) continue;

      const context = templateData.context;
      if (context && context.variables) {
        const issues = this.checkPolishVariableHandling(
          english,
          polish,
          context.variables,
        );
        if (issues.length > 0) {
          variableIssues.push({
            english,
            polish,
            variables: context.variables,
            issues,
            locations: templateData.description,
          });
        }
      }
    }

    return variableIssues;
  }

  // Check Polish variable handling (cases, gender agreement, etc.)
  checkPolishVariableHandling(english, polish, variables) {
    const issues = [];

    // Check for case agreement with variables
    for (const [varName, varInfo] of Object.entries(variables)) {
      if (varInfo.type === 'number') {
        if (!this.hasProperPolishNumberAgreement(polish, varName)) {
          issues.push({
            type: 'number_agreement',
            variable: varName,
            message:
              'Polish number-noun agreement needs attention (1, 2-4, 5+ patterns)',
            severity: 'high',
          });
        }
      }

      // Check for case inflection with string variables
      if (
        varInfo.type === 'string' &&
        this.needsPolishCaseInflection(polish, varName)
      ) {
        issues.push({
          type: 'case_inflection',
          variable: varName,
          message: 'Variable may need Polish case inflection based on context',
          severity: 'high',
        });
      }

      // Check for gender agreement with variables
      if (this.needsPolishGenderAgreement(polish, varName)) {
        issues.push({
          type: 'gender_agreement',
          variable: varName,
          message:
            'Variable may need Polish gender agreement (masculine/feminine/neuter)',
          severity: 'high',
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
      const polish = this.polishTranslations[english];
      if (!polish) continue;

      const context = templateData.context;
      if (context && context.primary_ui_type === 'title') {
        const issues = this.checkPolishTitle(english, polish);
        if (issues.length > 0) {
          titleIssues.push({
            english,
            polish,
            issues,
            locations: templateData.description,
          });
        }
      }
    }

    return titleIssues;
  }

  // Check Polish title quality
  checkPolishTitle(english, polish) {
    const issues = [];

    // Check capitalization (Polish uses sentence case)
    if (this.hasInappropriatePolishCapitalization(polish)) {
      issues.push({
        type: 'capitalization',
        message: 'Polish titles typically use sentence case, not title case',
        severity: 'low',
      });
    }

    // Check for appropriate Polish terminology
    if (this.shouldUseNativePolishTerms(english, polish)) {
      issues.push({
        type: 'terminology',
        message:
          'Consider using native Polish terminology instead of foreign borrowings',
        severity: 'medium',
      });
    }

    return issues;
  }

  // Polish-specific helper methods
  hasAppropriatePolishVerb(english, polish) {
    // Check for Polish imperative forms
    const polishImperativePatterns = [
      /ać$/,
      /eć$/,
      /ić$/,
      /ować$/, // Infinitive endings
      /aj$/,
      /ij$/,
      /uj$/, // Imperative endings
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
      // Check for common Polish action verbs
      const commonActionVerbs = [
        'dodaj',
        'zapisz',
        'usuń',
        'utwórz',
        'aktualizuj',
        'wyślij',
        'anuluj',
      ];
      return (
        commonActionVerbs.some((verb) => polish.toLowerCase().includes(verb)) ||
        polishImperativePatterns.some((pattern) =>
          pattern.test(polish.toLowerCase()),
        )
      );
    }

    return true;
  }

  hasInconsistentPolishFormality(polish) {
    // Check for mixed formal/informal usage
    const formalPatterns = ['Pan', 'Pani', 'Państwo'];
    const informalPatterns = ['ty', 'ci', 'cię', 'twój', 'twoja', 'twoje'];

    const hasFormal = formalPatterns.some((pattern) =>
      polish.includes(pattern),
    );
    const hasInformal = informalPatterns.some((pattern) =>
      polish.includes(pattern),
    );

    return hasFormal && hasInformal;
  }

  hasProperPolishGenderAgreement(polish) {
    // Basic check for gender agreement issues (this is simplified)

    // Look for obvious gender disagreement patterns
    const mismatchPatterns = [
      /jeden\s+\w+a$/, // jeden + feminine ending
      /jedna\s+\w+[^a]$/, // jedna + non-feminine ending
      /jedno\s+\w+[^o]$/, // jedno + non-neuter ending
    ];

    return !mismatchPatterns.some((pattern) =>
      pattern.test(polish.toLowerCase()),
    );
  }

  hasProperPolishCaseUsage(polish) {
    // Very basic check for case usage (this would need extensive linguistic analysis in reality)
    // Check for common prepositions that require specific cases

    // This is a very simplified check
    return !polish.includes('do ten') && !polish.includes('w tym');
  }

  needsPolishAspectCheck(english, polish) {
    // Check for verbs that might need aspect consideration
    const aspectSensitiveActions = [
      'save',
      'create',
      'update',
      'delete',
      'send',
    ];

    if (
      aspectSensitiveActions.some((action) =>
        english.toLowerCase().includes(action),
      )
    ) {
      // Check if Polish uses appropriate perfective/imperfective forms
      const perfectiveMarkers = [
        'zapisać',
        'utworzyć',
        'zaktualizować',
        'usunąć',
        'wysłać',
      ];
      const imperfectiveMarkers = [
        'zapisywać',
        'tworzyć',
        'aktualizować',
        'usuwać',
        'wysyłać',
      ];

      return (
        !perfectiveMarkers.some((marker) => polish.includes(marker)) &&
        !imperfectiveMarkers.some((marker) => polish.includes(marker))
      );
    }

    return false;
  }

  hasMissingPolishDiacritics(polish) {
    // Check for words that commonly need diacritical marks
    const diacriticWords = {
      dodac: 'dodać',
      usunac: 'usunąć',
      wiecej: 'więcej',
      moze: 'może',
      zeby: 'żeby',
      cos: 'coś',
      byc: 'być',
      nic: 'nic', // already correct
      rozny: 'różny',
    };

    for (const [wrong, correct] of Object.entries(diacriticWords)) {
      if (polish.toLowerCase().includes(wrong) && !polish.includes(correct)) {
        return true;
      }
    }
    return false;
  }

  hasImproperConsonantClusters(polish) {
    // Check for common consonant cluster issues
    const improperClusters = [
      /szcz[^eiaou]/, // szcz usually followed by vowel
      /prz[^eiaou]/, // prz usually followed by vowel
      /krz[^eiaou]/, // krz usually followed by vowel
    ];

    return improperClusters.some((pattern) =>
      pattern.test(polish.toLowerCase()),
    );
  }

  hasProperPolishNumberAgreement(polish, varName) {
    const numberVar = `{${varName}}`;
    if (polish.includes(numberVar)) {
      // Polish has complex number agreement: 1, 2-4, 5+
      // This is a very simplified check

      // Look for different forms based on number
      const singularMarkers = ['jeden', 'jedna', 'jedno'];
      const paucalMarkers = ['dwa', 'trzy', 'cztery']; // 2-4
      const pluralMarkers = ['pięć', 'sześć', 'więcej']; // 5+

      return (
        singularMarkers.some((marker) => polish.includes(marker)) ||
        paucalMarkers.some((marker) => polish.includes(marker)) ||
        pluralMarkers.some((marker) => polish.includes(marker))
      );
    }
    return true;
  }

  needsPolishCaseInflection(polish, varName) {
    const numberVar = `{${varName}}`;
    // Check if variable appears in context that requires specific case
    const caseMarkers = [
      'do',
      'od',
      'z',
      'w',
      'na',
      'o',
      'przez',
      'bez',
      'dla',
    ];
    return (
      polish.includes(numberVar) &&
      caseMarkers.some((marker) => polish.includes(marker))
    );
  }

  needsPolishGenderAgreement(polish, varName) {
    const numberVar = `{${varName}}`;
    // Check if variable appears in context that needs gender agreement
    return (
      polish.includes(numberVar) &&
      polish.match(/\s(ten|ta|to|jeden|jedna|jedno|mój|moja|moje)\s/)
    );
  }

  hasAppropriatePolishFormality(polish) {
    // Check for formal language markers
    const formalMarkers = ['Pan', 'Pani', 'Państwo', 'proszę', 'uprzejmie'];
    return formalMarkers.some((marker) => polish.includes(marker));
  }

  isPolishErrorTooAbrupt(polish) {
    // Check if error message is too abrupt
    const abruptPatterns = [
      'błąd',
      'niemożliwe',
      'zabronione',
      'nieprawidłowy',
    ];
    return abruptPatterns.some(
      (pattern) =>
        polish.toLowerCase().includes(pattern) &&
        !polish.includes('proszę') &&
        !polish.includes('przepraszamy') &&
        !polish.includes('niestety'),
    );
  }

  needsPolishConditional(polish) {
    // Check for contexts where conditional mood might be appropriate
    const conditionalMarkers = ['może', 'można', 'należy', 'warto'];
    return (
      !conditionalMarkers.some((marker) => polish.includes(marker)) &&
      (polish.includes('błąd') || polish.includes('problem'))
    );
  }

  hasInappropriatePolishCapitalization(polish) {
    // Check for English-style title case in Polish
    const words = polish.split(' ');
    if (words.length > 1) {
      // Count capitalized words (excluding first word and proper nouns)
      const capitalizedCount = words.slice(1).filter(
        (word) =>
          word.length > 2 &&
          word[0] === word[0].toUpperCase() &&
          !['I', 'II', 'III', 'IV', 'V'].includes(word) && // Roman numerals
          !word.match(/^[A-Z]+$/), // Acronyms are OK
      ).length;
      return capitalizedCount > 1;
    }
    return false;
  }

  shouldUseNativePolishTerms(english, polish) {
    // Check for excessive use of foreign borrowings where native terms exist
    const foreignTerms = [
      'email',
      'software',
      'hardware',
      'login',
      'website',
      'download',
    ];

    return foreignTerms.some((foreign) =>
      polish.toLowerCase().includes(foreign),
    );
  }

  // Generate improvement recommendations
  generateRecommendations() {
    return [
      '• Use formal address (Pan/Pani) consistently in professional contexts',
      '• Ensure proper case usage for all 7 Polish cases',
      '• Check masculine/feminine/neuter gender agreement',
      '• Use appropriate verb aspects (perfective/imperfective)',
      '• Add missing diacritical marks (ą, ć, ę, ł, ń, ó, ś, ź, ż)',
      '• Apply correct number agreement patterns (1, 2-4, 5+)',
      '• Include polite language markers (proszę, uprzejmie)',
      '• Check consonant cluster correctness',
      '• Use Polish sentence case for titles',
      '• Replace foreign borrowings with native Polish terms',
    ];
  }

  // Main analysis function
  analyze() {
    console.log('🔍 Starting Polish translation analysis...\n');

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

    console.log('\n📊 POLISH TRANSLATION ANALYSIS REPORT');
    console.log('==================================================');
    console.log(`Total improvement opportunities found: ${totalIssues}\n`);

    // Button issues
    if (buttonIssues.length > 0) {
      console.log(`🔘 BUTTON TRANSLATION ISSUES (${buttonIssues.length})`);
      console.log('------------------------------');
      buttonIssues.slice(0, 5).forEach((item, index) => {
        console.log(`${index + 1}. "${item.english}" → "${item.polish}"`);
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
        console.log(`${index + 1}. "${item.english}" → "${item.polish}"`);
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
        console.log(`${index + 1}. "${item.english}" → "${item.polish}"`);
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
      '1. Ensure consistent use of formal address (Pan/Pani) throughout',
    );
    console.log('2. Fix case usage issues for all 7 Polish cases');
    console.log('3. Check gender agreement (masculine/feminine/neuter)');
    console.log('4. Add missing diacritical marks and fix existing ones');
    console.log('5. Review verb aspects and number agreement patterns');
  }
}

// Run the analysis
if (require.main === module) {
  const analyzer = new PolishTranslationAnalyzer();
  analyzer.analyze();
}

module.exports = PolishTranslationAnalyzer;
