'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Finnish Translation Quality Analysis
 *
 * Analyzes Finnish translations against enhanced context to identify improvement opportunities
 * Focuses on Finnish language-specific grammar, style, and cultural adaptation
 */

class FinnishTranslationAnalyzer {
  constructor() {
    this.enhancedTemplate = {};
    this.finnishTranslations = {};
    this.issues = [];
    this.recommendations = [];
  }

  // Load enhanced template and Finnish translations
  loadData() {
    try {
      const rootDir = path.join(__dirname, '../../');
      const enhancedContent = fs.readFileSync(
        path.join(rootDir, 'template.json'),
        'utf8',
      );
      this.enhancedTemplate = JSON.parse(enhancedContent);

      const finnishContent = fs.readFileSync(
        path.join(rootDir, 'locales/fi.json'),
        'utf8',
      );
      this.finnishTranslations = JSON.parse(finnishContent);

      console.log(
        `📚 Loaded ${Object.keys(this.enhancedTemplate).length} enhanced template entries`,
      );
      console.log(
        `🇫🇮 Loaded ${Object.keys(this.finnishTranslations).length} Finnish translations`,
      );
    } catch (error) {
      console.error(`Error loading data: ${error.message}`);
      process.exit(1);
    }
  }

  // Check if Finnish translation follows button text conventions
  analyzeButtonTranslations() {
    const buttonIssues = [];

    for (const [english, templateData] of Object.entries(
      this.enhancedTemplate,
    )) {
      const finnish = this.finnishTranslations[english];
      if (!finnish) continue;

      const context = templateData.context;
      if (
        context &&
        context.primary_ui_type &&
        context.primary_ui_type.includes('button')
      ) {
        const issues = this.checkButtonTextQuality(english, finnish, context);
        if (issues.length > 0) {
          buttonIssues.push({
            english,
            finnish,
            context: context.primary_ui_type,
            issues,
            locations: templateData.description,
          });
        }
      }
    }

    return buttonIssues;
  }

  // Check button text quality for Finnish
  checkButtonTextQuality(english, finnish, context) {
    const issues = [];

    // Check length - Finnish can be significantly longer than English
    if (finnish.length > english.length * 3) {
      issues.push({
        type: 'length_concern',
        message: `Finnish text significantly longer than English (${finnish.length} vs ${english.length} chars)`,
        severity: 'medium',
      });
    }

    // Check for appropriate verb forms in action buttons (Finnish imperative)
    if (
      context.primary_ui_type === 'submit_button' ||
      context.primary_ui_type === 'action_button'
    ) {
      if (!this.hasAppropriateFinnishVerb(english, finnish)) {
        issues.push({
          type: 'verb_form',
          message:
            'Consider using Finnish imperative verb form for action buttons',
          severity: 'low',
        });
      }
    }

    // Check for case usage (Finnish has 15 cases!)
    if (this.hasIncorrectFinnishCase(finnish)) {
      issues.push({
        type: 'case_usage',
        message: 'Check Finnish case usage - ensure appropriate case selection',
        severity: 'high',
      });
    }

    // Check for vowel harmony (back/front vowels)
    if (this.violatesVowelHarmony(finnish)) {
      issues.push({
        type: 'vowel_harmony',
        message: 'Check Finnish vowel harmony (back/front vowel consistency)',
        severity: 'high',
      });
    }

    // Check for compound word appropriateness
    if (this.shouldUseFinnishCompound(english, finnish)) {
      issues.push({
        type: 'compound_word',
        message:
          'Consider Finnish compound word construction for better readability',
        severity: 'low',
      });
    }

    // Check for formal/informal address consistency (te/sinä)
    if (this.hasInconsistentFinnishAddress(finnish)) {
      issues.push({
        type: 'address_consistency',
        message: 'Check formal/informal address consistency (te/sinä)',
        severity: 'medium',
      });
    }

    return issues;
  }

  // Check variable handling in Finnish translations
  analyzeVariableHandling() {
    const variableIssues = [];

    for (const [english, templateData] of Object.entries(
      this.enhancedTemplate,
    )) {
      const finnish = this.finnishTranslations[english];
      if (!finnish) continue;

      const context = templateData.context;
      if (context && context.variables) {
        const issues = this.checkFinnishVariableHandling(
          english,
          finnish,
          context.variables,
        );
        if (issues.length > 0) {
          variableIssues.push({
            english,
            finnish,
            variables: context.variables,
            issues,
            locations: templateData.description,
          });
        }
      }
    }

    return variableIssues;
  }

  // Check Finnish variable handling (cases, agreement, etc.)
  checkFinnishVariableHandling(english, finnish, variables) {
    const issues = [];

    // Check for number-noun agreement issues with partitive vs accusative
    for (const [varName, varInfo] of Object.entries(variables)) {
      if (varInfo.type === 'number') {
        if (!this.hasProperFinnishNumberAgreement(finnish, varName)) {
          issues.push({
            type: 'number_agreement',
            variable: varName,
            message:
              'Finnish number-noun agreement may need attention (partitive vs accusative)',
            severity: 'high',
          });
        }
      }

      // Check for proper case usage with variables
      if (this.needsFinnishCaseAdjustment(finnish, varName)) {
        issues.push({
          type: 'case_adjustment',
          variable: varName,
          message: 'Variable may need Finnish case inflection in context',
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
      const finnish = this.finnishTranslations[english];
      if (!finnish) continue;

      const context = templateData.context;
      if (context && context.primary_ui_type === 'title') {
        const issues = this.checkFinnishTitle(english, finnish);
        if (issues.length > 0) {
          titleIssues.push({
            english,
            finnish,
            issues,
            locations: templateData.description,
          });
        }
      }
    }

    return titleIssues;
  }

  // Check Finnish title quality
  checkFinnishTitle(english, finnish) {
    const issues = [];

    // Check capitalization (Finnish uses sentence case)
    if (this.hasInappropriateFinnishCapitalization(finnish)) {
      issues.push({
        type: 'capitalization',
        message: 'Finnish titles typically use sentence case, not title case',
        severity: 'low',
      });
    }

    // Check for appropriate Finnish terminology
    if (this.shouldUseNativeFinnishTerms(english, finnish)) {
      issues.push({
        type: 'terminology',
        message:
          'Consider using native Finnish terminology instead of loanwords',
        severity: 'medium',
      });
    }

    return issues;
  }

  // Finnish-specific helper methods
  hasAppropriateFinnishVerb(english, finnish) {
    // Check for Finnish imperative forms
    const finnishImperativePatterns = [
      /^[a-zäöå]+$/, // Simple imperative
      /^[a-zäöå]+\s+[a-zäöå]+$/, // Two-word imperative
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
      return (
        finnishImperativePatterns.some((pattern) =>
          pattern.test(finnish.toLowerCase()),
        ) ||
        finnish
          .toLowerCase()
          .match(/^(lisää|tallenna|poista|luo|päivitä|lähetä|peruuta)/)
      );
    }

    return true; // Default to OK if not an action word
  }

  hasIncorrectFinnishCase(finnish) {
    // Check for potential case usage issues
    // This is very simplified - real Finnish case analysis would be extremely complex
    const caseEndings =
      /\b\w+(ssa|ssä|sta|stä|lle|ksi|tta|ttä|na|nä|tta|ine)\b/g;
    const matches = finnish.match(caseEndings);

    if (matches) {
      // Very basic check for suspicious patterns
      return matches.some((match) => match.length > 15); // Very long words might indicate incorrect case stacking
    }
    return false;
  }

  violatesVowelHarmony(finnish) {
    // Check for vowel harmony violations
    const backVowels = /[aou]/;
    const frontVowels = /[äöy]/;

    const words = finnish.split(/\s+/);

    for (const word of words) {
      const hasBack = backVowels.test(word);
      const hasFront = frontVowels.test(word);

      // Mixed back and front vowels in same word violates harmony (except neutrals)
      if (hasBack && hasFront) {
        // Check if it's a compound word or loanword (more complex analysis needed)
        if (word.length > 6 && !word.includes('-')) {
          return true;
        }
      }
    }
    return false;
  }

  shouldUseFinnishCompound(english, finnish) {
    // Check if English compound could be better expressed as Finnish compound
    const englishWords = english.split(' ');
    const finnishWords = finnish.split(' ');

    // If English has 2 words and Finnish has 2+ words, suggest compound
    return (
      englishWords.length === 2 &&
      finnishWords.length >= 2 &&
      !finnish.includes(' ja ') &&
      !finnish.includes(' tai ')
    ); // Not with conjunctions
  }

  hasInconsistentFinnishAddress(finnish) {
    // Check for mixing formal/informal address
    const formalMarkers = /\b(te|teidän|teille|teiltä)\b/i;
    const informalMarkers = /\b(sinä|sinun|sinulle|sinulta)\b/i;

    return formalMarkers.test(finnish) && informalMarkers.test(finnish);
  }

  hasProperFinnishNumberAgreement(finnish, varName) {
    // Check for potential number agreement issues
    const numberVar = `{${varName}}`;
    if (finnish.includes(numberVar)) {
      // Look for partitive vs accusative usage patterns
      // Very simplified check
      return !finnish.match(new RegExp(`${numberVar}\\s+\\w+(a|ä)\\s`)); // Basic partitive check
    }
    return true;
  }

  needsFinnishCaseAdjustment(finnish, varName) {
    const numberVar = `{${varName}}`;
    // Check if variable appears in context that might need case inflection
    return (
      finnish.includes(numberVar) &&
      finnish.match(/\s(kanssa|ilman|jälkeen|aikana|takia|vuoksi)\s/)
    );
  }

  hasInappropriateFinnishCapitalization(finnish) {
    // Check for English-style title case in Finnish
    const words = finnish.split(' ');
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

  shouldUseNativeFinnishTerms(english, finnish) {
    // Check for excessive use of loanwords where native terms exist
    const loanwords = ['kompuuteri', 'internet', 'email', 'file', 'softa'];

    return loanwords.some((loanword) =>
      finnish.toLowerCase().includes(loanword),
    );
  }

  // Generate improvement recommendations
  generateRecommendations() {
    return [
      '• Use Finnish sentence case for titles instead of English title case',
      '• Maintain consistency in formal/informal address (te vs sinä)',
      '• Use Finnish imperative verb forms for action buttons',
      '• Pay careful attention to Finnish case usage (15 cases available)',
      '• Ensure vowel harmony compliance (back/front vowel consistency)',
      '• Check consonant gradation in inflected forms',
      '• Consider partitive vs accusative usage with numbers',
      '• Include polite language markers in error messages (anteeksi, kiitos)',
      '• Prefer native Finnish terms over loanwords where appropriate',
      '• Use Finnish compound word construction for technical terms',
      '• Ensure proper case inflection for variables in context',
    ];
  }

  // Main analysis function
  analyze() {
    console.log('🔍 Starting Finnish translation analysis...\n');

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

    console.log('\n📊 FINNISH TRANSLATION ANALYSIS REPORT');
    console.log('==================================================');
    console.log(`Total improvement opportunities found: ${totalIssues}\n`);

    // Button issues
    if (buttonIssues.length > 0) {
      console.log(`🔘 BUTTON TRANSLATION ISSUES (${buttonIssues.length})`);
      console.log('------------------------------');
      buttonIssues.slice(0, 5).forEach((item, index) => {
        console.log(`${index + 1}. "${item.english}" → "${item.finnish}"`);
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
        console.log(`${index + 1}. "${item.english}" → "${item.finnish}"`);
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
        console.log(`${index + 1}. "${item.english}" → "${item.finnish}"`);
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
      '1. Focus on Finnish case usage and variable inflection (highest complexity)',
    );
    console.log('2. Check vowel harmony compliance in compound words');
    console.log('3. Review partitive vs accusative usage with numbers');
    console.log('5. Ensure formal/informal address consistency (te vs sinä)');
  }
}

// Run the analysis
if (require.main === module) {
  const analyzer = new FinnishTranslationAnalyzer();
  analyzer.analyze();
}

module.exports = FinnishTranslationAnalyzer;
