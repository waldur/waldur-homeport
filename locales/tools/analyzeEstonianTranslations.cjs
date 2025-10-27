'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Estonian Translation Quality Analysis
 *
 * Analyzes Estonian translations against enhanced context to identify improvement opportunities
 * Focuses on Estonian language-specific grammar, style, and cultural adaptation
 */

class EstonianTranslationAnalyzer {
  constructor() {
    this.enhancedTemplate = {};
    this.estonianTranslations = {};
    this.issues = [];
    this.recommendations = [];
  }

  // Load enhanced template and Estonian translations
  loadData() {
    try {
      const rootDir = path.join(__dirname, '../../');
      const enhancedContent = fs.readFileSync(
        path.join(rootDir, 'template.json'),
        'utf8',
      );
      this.enhancedTemplate = JSON.parse(enhancedContent);

      const estonianContent = fs.readFileSync(
        path.join(rootDir, 'locales/et.json'),
        'utf8',
      );
      this.estonianTranslations = JSON.parse(estonianContent);

      console.log(
        `📚 Loaded ${Object.keys(this.enhancedTemplate).length} enhanced template entries`,
      );
      console.log(
        `🇪🇪 Loaded ${Object.keys(this.estonianTranslations).length} Estonian translations`,
      );
    } catch (error) {
      console.error(`Error loading data: ${error.message}`);
      process.exit(1);
    }
  }

  // Check if Estonian translation follows button text conventions
  analyzeButtonTranslations() {
    const buttonIssues = [];

    for (const [english, templateData] of Object.entries(
      this.enhancedTemplate,
    )) {
      const estonian = this.estonianTranslations[english];
      if (!estonian) continue;

      const context = templateData.context;
      if (
        context &&
        context.primary_ui_type &&
        context.primary_ui_type.includes('button')
      ) {
        const issues = this.checkButtonTextQuality(english, estonian, context);
        if (issues.length > 0) {
          buttonIssues.push({
            english,
            estonian,
            context: context.primary_ui_type,
            issues,
            locations: templateData.description,
          });
        }
      }
    }

    return buttonIssues;
  }

  // Check button text quality for Estonian
  checkButtonTextQuality(english, estonian, context) {
    const issues = [];

    // Check length - Estonian tends to be longer than English
    if (estonian.length > english.length * 3) {
      issues.push({
        type: 'length_concern',
        message: `Estonian text significantly longer than English (${estonian.length} vs ${english.length} chars)`,
        severity: 'medium',
      });
    }

    // Check for appropriate verb forms in action buttons (Estonian imperative)
    if (
      context.primary_ui_type === 'submit_button' ||
      context.primary_ui_type === 'action_button'
    ) {
      if (!this.hasAppropriateEstonianVerb(english, estonian)) {
        issues.push({
          type: 'verb_form',
          message:
            'Consider using Estonian imperative verb form (da-infinitive) for action buttons',
          severity: 'low',
        });
      }
    }

    // Check for case consistency (Estonian nouns have 14 cases)
    if (this.hasInconsistentEstonianCase(estonian)) {
      issues.push({
        type: 'case_consistency',
        message: 'Check Estonian case usage - ensure consistency with context',
        severity: 'medium',
      });
    }

    // Check for compound word appropriateness
    if (this.shouldUseEstonianCompound(english, estonian)) {
      issues.push({
        type: 'compound_word',
        message:
          'Consider Estonian compound word construction for better readability',
        severity: 'low',
      });
    }

    return issues;
  }

  // Check variable handling in Estonian translations
  analyzeVariableHandling() {
    const variableIssues = [];

    for (const [english, templateData] of Object.entries(
      this.enhancedTemplate,
    )) {
      const estonian = this.estonianTranslations[english];
      if (!estonian) continue;

      const context = templateData.context;
      if (context && context.variables) {
        const issues = this.checkEstonianVariableHandling(
          english,
          estonian,
          context.variables,
        );
        if (issues.length > 0) {
          variableIssues.push({
            english,
            estonian,
            variables: context.variables,
            issues,
            locations: templateData.description,
          });
        }
      }
    }

    return variableIssues;
  }

  // Check Estonian variable handling (cases, agreement, etc.)
  checkEstonianVariableHandling(english, estonian, variables) {
    const issues = [];

    // Check for number-noun agreement issues
    for (const [varName, varInfo] of Object.entries(variables)) {
      if (varInfo.type === 'number') {
        if (!this.hasProperEstonianNumberAgreement(estonian, varName)) {
          issues.push({
            type: 'number_agreement',
            variable: varName,
            message:
              'Estonian number-noun agreement may need attention (singular/plural forms)',
            severity: 'high',
          });
        }
      }

      // Check for proper case usage with variables
      if (
        varInfo.type === 'string' &&
        this.needsEstonianCaseAdjustment(estonian, varName)
      ) {
        issues.push({
          type: 'case_adjustment',
          variable: varName,
          message: 'Variable may need Estonian case inflection in context',
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
      const estonian = this.estonianTranslations[english];
      if (!estonian) continue;

      const context = templateData.context;
      if (context && context.primary_ui_type === 'title') {
        const issues = this.checkEstonianTitle(english, estonian);
        if (issues.length > 0) {
          titleIssues.push({
            english,
            estonian,
            issues,
            locations: templateData.description,
          });
        }
      }
    }

    return titleIssues;
  }

  // Check Estonian title quality
  checkEstonianTitle(english, estonian) {
    const issues = [];

    // Check capitalization (Estonian uses sentence case)
    if (this.hasInappropriateEstonianCapitalization(estonian)) {
      issues.push({
        type: 'capitalization',
        message: 'Estonian titles typically use sentence case, not title case',
        severity: 'low',
      });
    }

    // Check for appropriate Estonian terminology
    if (this.shouldUseNativeEstonianTerms(english, estonian)) {
      issues.push({
        type: 'terminology',
        message:
          'Consider using native Estonian terminology instead of loanwords',
        severity: 'medium',
      });
    }

    return issues;
  }

  // Estonian-specific helper methods
  hasAppropriateEstonianVerb(english, estonian) {
    // Check for Estonian imperative forms (da-infinitive or imperative mood)
    const estonianImperativePatterns = [
      /ma$/,
      /da$/,
      /mine$/, // da-infinitive endings
      /\/.*[ae]$/, // imperative mood
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
      return estonianImperativePatterns.some((pattern) =>
        pattern.test(estonian.toLowerCase()),
      );
    }

    return true; // Default to OK if not an action word
  }

  hasInconsistentEstonianCase(estonian) {
    // Basic check for potential case inconsistencies
    // This is simplified - real implementation would need more sophisticated analysis
    return estonian.includes('_') || estonian.match(/[A-Z]{2,}/);
  }

  shouldUseEstonianCompound(english, estonian) {
    // Check if English compound could be better expressed as Estonian compound
    const englishWords = english.split(' ');
    const estonianWords = estonian.split(' ');

    // If English has 2 words and Estonian has 2+ words, suggest compound
    return (
      englishWords.length === 2 &&
      estonianWords.length >= 2 &&
      !estonian.includes('ja') &&
      !estonian.includes('või')
    ); // Not with conjunctions
  }

  hasProperEstonianNumberAgreement(estonian, varName) {
    // Check for potential number agreement issues
    // This is simplified - real implementation would need morphological analysis
    const numberVar = `{${varName}}`;
    if (estonian.includes(numberVar)) {
      // Look for patterns that might indicate missing plural handling
      return !estonian.match(new RegExp(`${numberVar}\\s+\\w+[^d]$`)); // Very basic check
    }
    return true;
  }

  needsEstonianCaseAdjustment(estonian, varName) {
    const numberVar = `{${varName}}`;
    // Check if variable appears in context that might need case inflection
    return (
      estonian.includes(numberVar) &&
      estonian.match(/\s(kohta|jaoks|poolt|kaudu)\s/)
    );
  }

  hasInappropriateEstonianCapitalization(estonian) {
    // Check for English-style title case in Estonian
    const words = estonian.split(' ');
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

  shouldUseNativeEstonianTerms(english, estonian) {
    // Check for excessive use of loanwords where native terms exist
    const loanwords = ['kompjuter', 'internet', 'email', 'fail', 'kataloog'];

    // Check for incorrect translations
    const incorrectTranslations = [
      { english: 'floating ip', incorrect: 'ujuv ip', correct: 'liikuv ip' },
    ];

    const hasLoanword = loanwords.some((loanword) =>
      estonian.toLowerCase().includes(loanword),
    );

    const hasIncorrectTranslation = incorrectTranslations.some(
      (item) =>
        english.toLowerCase().includes(item.english) &&
        estonian.toLowerCase().includes(item.incorrect),
    );

    return hasLoanword || hasIncorrectTranslation;
  }

  // Generate improvement recommendations
  generateRecommendations() {
    return [
      '• Use Estonian sentence case for titles instead of English title case',
      '• Prefer native Estonian terms over loanwords when available',
      '• Use da-infinitive or imperative mood for action buttons',
      '• Pay attention to Estonian case agreement with variables',
      '• Include polite language markers in error messages (palun, vabandust)',
      '• Consider Estonian compound word construction for technical terms',
      '• Ensure proper number-noun agreement for dynamic content',
      '• Use formal "te" form in professional contexts',
      '• Adapt technical terminology to Estonian language patterns',
      '• Use "Liikuv IP" not "Ujuv IP" for "Floating IP" translations',
    ];
  }

  // Main analysis function
  analyze() {
    console.log('🔍 Starting Estonian translation analysis...\n');

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

    console.log('\n📊 ESTONIAN TRANSLATION ANALYSIS REPORT');
    console.log('==================================================');
    console.log(`Total improvement opportunities found: ${totalIssues}\n`);

    // Button issues
    if (buttonIssues.length > 0) {
      console.log(`🔘 BUTTON TRANSLATION ISSUES (${buttonIssues.length})`);
      console.log('------------------------------');
      buttonIssues.slice(0, 5).forEach((item, index) => {
        console.log(`${index + 1}. "${item.english}" → "${item.estonian}"`);
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
        console.log(`${index + 1}. "${item.english}" → "${item.estonian}"`);
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
        console.log(`${index + 1}. "${item.english}" → "${item.estonian}"`);
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
      '1. Focus on variable handling and case agreement issues first',
    );
    console.log('2. Review button text for Estonian imperative forms');
    console.log('4. Standardize title capitalization to Estonian conventions');
    console.log(
      '5. Replace loanwords with native Estonian terms where appropriate',
    );
  }
}

// Run the analysis
if (require.main === module) {
  const analyzer = new EstonianTranslationAnalyzer();
  analyzer.analyze();
}

module.exports = EstonianTranslationAnalyzer;
