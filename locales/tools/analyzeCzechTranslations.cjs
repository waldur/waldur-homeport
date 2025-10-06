'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Czech Translation Quality Analysis
 *
 * Analyzes Czech translations against enhanced context to identify improvement opportunities
 * Focuses on Czech language-specific grammar, style, and cultural adaptation
 */

class CzechTranslationAnalyzer {
  constructor() {
    this.enhancedTemplate = {};
    this.czechTranslations = {};
    this.issues = [];
    this.recommendations = [];
  }

  // Load enhanced template and Czech translations
  loadData() {
    try {
      const rootDir = path.join(__dirname, '../../');
      const enhancedContent = fs.readFileSync(
        path.join(rootDir, 'template.json'),
        'utf8',
      );
      this.enhancedTemplate = JSON.parse(enhancedContent);

      const czechContent = fs.readFileSync(
        path.join(rootDir, 'locales/cs.json'),
        'utf8',
      );
      this.czechTranslations = JSON.parse(czechContent);

      console.log(
        `📚 Loaded ${Object.keys(this.enhancedTemplate).length} enhanced template entries`,
      );
      console.log(
        `🇨🇿 Loaded ${Object.keys(this.czechTranslations).length} Czech translations`,
      );
    } catch (error) {
      console.error(`Error loading data: ${error.message}`);
      process.exit(1);
    }
  }

  // Check if Czech translation follows button text conventions
  analyzeButtonTranslations() {
    const buttonIssues = [];

    for (const [english, templateData] of Object.entries(
      this.enhancedTemplate,
    )) {
      const czech = this.czechTranslations[english];
      if (!czech) continue;

      const context = templateData.context;
      if (
        context &&
        context.primary_ui_type &&
        context.primary_ui_type.includes('button')
      ) {
        const issues = this.checkButtonTextQuality(english, czech, context);
        if (issues.length > 0) {
          buttonIssues.push({
            english,
            czech,
            context: context.primary_ui_type,
            issues,
            locations: templateData.description,
          });
        }
      }
    }

    return buttonIssues;
  }

  // Check button text quality for Czech
  checkButtonTextQuality(english, czech, context) {
    const issues = [];

    // Check length - Czech tends to be longer than English
    if (czech.length > english.length * 3.0) {
      issues.push({
        type: 'length_concern',
        message: `Czech text significantly longer than English (${czech.length} vs ${english.length} chars)`,
        severity: 'medium',
      });
    }

    // Check for appropriate verb forms in action buttons (Czech infinitive or imperative)
    if (
      context.primary_ui_type === 'submit_button' ||
      context.primary_ui_type === 'action_button'
    ) {
      if (!this.hasAppropriateCzechVerb(english, czech)) {
        issues.push({
          type: 'verb_form',
          message:
            'Consider using Czech infinitive (-t/-ci) or imperative verb form for action buttons',
          severity: 'low',
        });
      }
    }

    // Check for case consistency (Czech has 7 cases)
    if (this.hasInconsistentCzechCase(czech)) {
      issues.push({
        type: 'case_consistency',
        message:
          'Check Czech case usage - ensure consistency with grammatical context',
        severity: 'medium',
      });
    }

    // Check for gender agreement issues (3 genders including animate/inanimate masculine)
    if (this.hasGenderAgreementIssues(czech)) {
      issues.push({
        type: 'gender_agreement',
        message:
          'Check Czech gender agreement (masculine animate/inanimate, feminine, neuter)',
        severity: 'medium',
      });
    }

    // Check for proper háček usage
    if (this.missingCzechHacek(english, czech)) {
      issues.push({
        type: 'hacek_usage',
        message: 'Check Czech háček usage (č, ď, ě, ň, ř, š, ť, ž)',
        severity: 'high',
      });
    }

    return issues;
  }

  // Check variable handling in Czech translations
  analyzeVariableHandling() {
    const variableIssues = [];

    for (const [english, templateData] of Object.entries(
      this.enhancedTemplate,
    )) {
      const czech = this.czechTranslations[english];
      if (!czech) continue;

      const context = templateData.context;
      if (context && context.variables) {
        const issues = this.checkCzechVariableHandling(
          english,
          czech,
          context.variables,
        );
        if (issues.length > 0) {
          variableIssues.push({
            english,
            czech,
            variables: context.variables,
            issues,
            locations: templateData.description,
          });
        }
      }
    }

    return variableIssues;
  }

  // Check Czech variable handling (cases, gender agreement, etc.)
  checkCzechVariableHandling(english, czech, variables) {
    const issues = [];

    // Check for number-noun agreement issues
    for (const [varName, varInfo] of Object.entries(variables)) {
      if (varInfo.type === 'number') {
        if (!this.hasProperCzechNumberAgreement(czech, varName)) {
          issues.push({
            type: 'number_agreement',
            variable: varName,
            message:
              'Czech number-noun agreement may need attention (singular/plural/paucal forms)',
            severity: 'high',
          });
        }
      }

      // Check for proper case usage with variables
      if (
        varInfo.type === 'string' &&
        this.needsCzechCaseAdjustment(czech, varName)
      ) {
        issues.push({
          type: 'case_adjustment',
          variable: varName,
          message:
            'Variable may need Czech case inflection in grammatical context',
          severity: 'medium',
        });
      }

      // Check for gender agreement with variables
      if (this.needsCzechGenderAgreement(czech, varName)) {
        issues.push({
          type: 'gender_agreement',
          variable: varName,
          message: 'Variable may need gender agreement in Czech context',
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
      const czech = this.czechTranslations[english];
      if (!czech) continue;

      const context = templateData.context;
      if (context && context.primary_ui_type === 'title') {
        const issues = this.checkCzechTitle(english, czech);
        if (issues.length > 0) {
          titleIssues.push({
            english,
            czech,
            issues,
            locations: templateData.description,
          });
        }
      }
    }

    return titleIssues;
  }

  // Check Czech title quality
  checkCzechTitle(english, czech) {
    const issues = [];

    // Check capitalization (Czech uses sentence case)
    if (this.hasInappropriateCzechCapitalization(czech)) {
      issues.push({
        type: 'capitalization',
        message: 'Czech titles typically use sentence case, not title case',
        severity: 'low',
      });
    }

    // Check for appropriate Czech terminology
    if (this.shouldUseNativeCzechTerms(english, czech)) {
      issues.push({
        type: 'terminology',
        message: 'Consider using native Czech terminology instead of loanwords',
        severity: 'medium',
      });
    }

    // Check for consonant cluster handling
    if (this.hasProblematicConsonantClusters(czech)) {
      issues.push({
        type: 'consonant_clusters',
        message: 'Check Czech consonant cluster pronunciation and readability',
        severity: 'low',
      });
    }

    return issues;
  }

  // Czech-specific helper methods
  hasAppropriateCzechVerb(english, czech) {
    // Check for Czech infinitive forms (-t, -ci) or imperative mood
    const czechVerbPatterns = [
      /t$/,
      /ci$/,
      /it$/,
      /et$/, // infinitive endings
      /te$/,
      /ej$/,
      /i$/, // imperative forms
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
      return czechVerbPatterns.some((pattern) =>
        pattern.test(czech.toLowerCase()),
      );
    }

    return true; // Default to OK if not an action word
  }

  hasInconsistentCzechCase(czech) {
    // Basic check for potential case inconsistencies
    // Check for inappropriate mixing of different case patterns
    return czech.includes('_') || czech.match(/[A-ZČĎĚŇŘŠŤŽ]{3,}/);
  }

  hasGenderAgreementIssues(czech) {
    // Check for potential gender agreement issues including animate/inanimate
    const mismatchPatterns = [
      /ý\s+[ae]/i, // masculine adjective with feminine/neuter noun
      /á\s+[eo]/i, // feminine adjective with masculine/neuter noun
      /é\s+[ay]/i, // neuter adjective with masculine/feminine noun
    ];

    return mismatchPatterns.some((pattern) => pattern.test(czech));
  }

  missingCzechHacek(english, czech) {
    // Check if Czech text might be missing háček marks
    const suspiciousPatterns = [
      /ch(?![aeiouáéíóú])/, // 'ch' should probably be 'č'
      /sh(?![aeiouáéíóú])/, // 'sh' should probably be 'š'
      /[cstzndr](?=[iíeě])/, // consonants that might need háček before front vowels
    ];

    return suspiciousPatterns.some((pattern) =>
      pattern.test(czech.toLowerCase()),
    );
  }

  hasProperCzechNumberAgreement(czech, varName) {
    // Check for Czech number agreement including special rules for 2-4
    const numberVar = `{${varName}}`;
    if (czech.includes(numberVar)) {
      // Czech has special forms for 2-4 (paucal) vs 5+ (plural)
      return !czech.match(new RegExp(`${numberVar}\\s+\\w+[^yaiů]$`));
    }
    return true;
  }

  needsCzechCaseAdjustment(czech, varName) {
    const variablePattern = `{${varName}}`;
    // Check if variable appears in context that requires specific case
    const caseRequiringContexts = [
      /\s(s|bez|do|od|na|v|za|pro|po|před|přes)\s/, // prepositions requiring specific cases
      /\s(kolem|mimo|během|díky|kvůli)\s/, // more prepositions
    ];

    return (
      czech.includes(variablePattern) &&
      caseRequiringContexts.some((pattern) => pattern.test(czech))
    );
  }

  needsCzechGenderAgreement(czech, varName) {
    const variablePattern = `{${varName}}`;
    // Check if variable appears with adjectives that need gender agreement
    return (
      czech.includes(variablePattern) &&
      czech.match(/\s(nový|starý|dobrý|špatný|velký|malý)\s/)
    );
  }

  hasInappropriateCzechCapitalization(czech) {
    // Check for English-style title case in Czech
    const words = czech.split(' ');
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

  shouldUseNativeCzechTerms(english, czech) {
    // Check for excessive use of loanwords where native terms exist
    const loanwords = ['kompjuter', 'internetový', 'emejl', 'fajl'];

    return loanwords.some((loanword) => czech.toLowerCase().includes(loanword));
  }

  hasProblematicConsonantClusters(czech) {
    // Check for potentially problematic consonant clusters
    const difficultClusters = [
      /[bcdfghjklmnpqrstvwxz]{4,}/, // 4+ consonants in a row
      /[šč][bcdfg]/, // specific difficult combinations
    ];

    return difficultClusters.some((pattern) =>
      pattern.test(czech.toLowerCase()),
    );
  }

  // Generate improvement recommendations
  generateRecommendations() {
    return [
      '• Use Czech sentence case for titles instead of English title case',
      '• Prefer native Czech terms over loanwords when available',
      '• Use infinitive (-t/-ci) or imperative forms for action buttons',
      '• Pay attention to Czech case agreement with variables (7 cases)',
      '• Include polite language markers in error messages (prosím, omlouváme se)',
      '• Ensure proper gender agreement (masculine animate/inanimate, feminine, neuter)',
      '• Use proper Czech háček marks (č, ď, ě, ň, ř, š, ť, ž)',
      '• Check number agreement including special forms for 2-4 vs 5+',
      '• Use formal "vy" form in professional contexts',
      '• Consider verb aspect usage (perfective/imperfective) for proper meaning',
      '• Watch consonant cluster readability and pronunciation',
    ];
  }

  // Main analysis function
  analyze() {
    console.log('🔍 Starting Czech translation analysis...\n');

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

    console.log('\n📊 CZECH TRANSLATION ANALYSIS REPORT');
    console.log('==================================================');
    console.log(`Total improvement opportunities found: ${totalIssues}\n`);

    // Button issues
    if (buttonIssues.length > 0) {
      console.log(`🔘 BUTTON TRANSLATION ISSUES (${buttonIssues.length})`);
      console.log('------------------------------');
      buttonIssues.slice(0, 5).forEach((item, index) => {
        console.log(`${index + 1}. "${item.english}" → "${item.czech}"`);
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
        console.log(`${index + 1}. "${item.english}" → "${item.czech}"`);
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
        console.log(`${index + 1}. "${item.english}" → "${item.czech}"`);
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
    console.log('1. Focus on case agreement and gender agreement issues first');
    console.log(
      '2. Review button text for Czech infinitive or imperative forms',
    );
    console.log('3. Ensure proper háček usage for Czech characters');
    console.log('4. Check number agreement including 2-4 paucal forms');
    console.log('6. Standardize title capitalization to Czech conventions');
  }
}

// Run the analysis
if (require.main === module) {
  const analyzer = new CzechTranslationAnalyzer();
  analyzer.analyze();
}

module.exports = CzechTranslationAnalyzer;
