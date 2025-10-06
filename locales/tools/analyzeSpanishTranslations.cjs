'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Spanish Translation Quality Analysis
 *
 * Analyzes Spanish translations against enhanced context to identify improvement opportunities
 * Focuses on Spanish language-specific grammar, style, and cultural adaptation
 */

class SpanishTranslationAnalyzer {
  constructor() {
    this.enhancedTemplate = {};
    this.spanishTranslations = {};
    this.issues = [];
    this.recommendations = [];
  }

  // Load enhanced template and Spanish translations
  loadData() {
    try {
      const rootDir = path.join(__dirname, '../../');
      const enhancedContent = fs.readFileSync(
        path.join(rootDir, 'template.json'),
        'utf8',
      );
      this.enhancedTemplate = JSON.parse(enhancedContent);

      const spanishContent = fs.readFileSync(
        path.join(rootDir, 'locales/es.json'),
        'utf8',
      );
      this.spanishTranslations = JSON.parse(spanishContent);

      console.log(
        `📚 Loaded ${Object.keys(this.enhancedTemplate).length} enhanced template entries`,
      );
      console.log(
        `🇪🇸 Loaded ${Object.keys(this.spanishTranslations).length} Spanish translations`,
      );
    } catch (error) {
      console.error(`Error loading data: ${error.message}`);
      process.exit(1);
    }
  }

  // Check if Spanish translation follows button text conventions
  analyzeButtonTranslations() {
    const buttonIssues = [];

    for (const [english, templateData] of Object.entries(
      this.enhancedTemplate,
    )) {
      const spanish = this.spanishTranslations[english];
      if (!spanish) continue;

      const context = templateData.context;
      if (
        context &&
        context.primary_ui_type &&
        context.primary_ui_type.includes('button')
      ) {
        const issues = this.checkButtonTextQuality(english, spanish, context);
        if (issues.length > 0) {
          buttonIssues.push({
            english,
            spanish,
            context: context.primary_ui_type,
            issues,
            locations: templateData.description,
          });
        }
      }
    }

    return buttonIssues;
  }

  // Check button text quality for Spanish
  checkButtonTextQuality(english, spanish, context) {
    const issues = [];

    // Check length - Spanish tends to be longer than English
    if (spanish.length > english.length * 2.2) {
      issues.push({
        type: 'length_concern',
        message: `Spanish text significantly longer than English (${spanish.length} vs ${english.length} chars)`,
        severity: 'medium',
      });
    }

    // Check for appropriate verb forms in action buttons (Spanish imperative)
    if (
      context.primary_ui_type === 'submit_button' ||
      context.primary_ui_type === 'action_button'
    ) {
      if (!this.hasAppropriateSpanishVerb(english, spanish)) {
        issues.push({
          type: 'verb_form',
          message:
            'Consider using Spanish imperative verb form for action buttons',
          severity: 'low',
        });
      }
    }

    // Check for formal/informal address consistency
    if (this.hasInconsistentSpanishFormality(spanish)) {
      issues.push({
        type: 'formality_consistency',
        message:
          'Check usted/tú consistency - use formal "usted" in professional contexts',
        severity: 'high',
      });
    }

    // Check gender agreement
    if (!this.hasProperSpanishGenderAgreement(spanish)) {
      issues.push({
        type: 'gender_agreement',
        message: 'Check masculine/feminine gender agreement in Spanish',
        severity: 'high',
      });
    }

    // Check for proper accent marks
    if (this.hasMissingAccents(spanish)) {
      issues.push({
        type: 'accent_marks',
        message:
          'Check for missing or incorrect accent marks (á, é, í, ó, ú, ñ)',
        severity: 'medium',
      });
    }

    // Check reflexive pronoun usage
    if (this.needsReflexivePronouns(english, spanish)) {
      issues.push({
        type: 'reflexive_pronouns',
        message: 'Consider reflexive pronoun usage (se, me, te, etc.)',
        severity: 'medium',
      });
    }

    return issues;
  }

  // Check variable handling in Spanish translations
  analyzeVariableHandling() {
    const variableIssues = [];

    for (const [english, templateData] of Object.entries(
      this.enhancedTemplate,
    )) {
      const spanish = this.spanishTranslations[english];
      if (!spanish) continue;

      const context = templateData.context;
      if (context && context.variables) {
        const issues = this.checkSpanishVariableHandling(
          english,
          spanish,
          context.variables,
        );
        if (issues.length > 0) {
          variableIssues.push({
            english,
            spanish,
            variables: context.variables,
            issues,
            locations: templateData.description,
          });
        }
      }
    }

    return variableIssues;
  }

  // Check Spanish variable handling (gender agreement, plurals, etc.)
  checkSpanishVariableHandling(english, spanish, variables) {
    const issues = [];

    // Check for gender agreement with variables
    for (const [varName, varInfo] of Object.entries(variables)) {
      if (varInfo.type === 'number') {
        if (!this.hasProperSpanishNumberAgreement(spanish, varName)) {
          issues.push({
            type: 'number_agreement',
            variable: varName,
            message:
              'Spanish number-noun agreement may need attention (singular/plural)',
            severity: 'high',
          });
        }
      }

      // Check for gender agreement with string variables
      if (
        varInfo.type === 'string' &&
        this.needsSpanishGenderAgreement(spanish, varName)
      ) {
        issues.push({
          type: 'gender_agreement',
          variable: varName,
          message:
            'Variable may need Spanish gender agreement (masculine/feminine)',
          severity: 'high',
        });
      }

      // Check for subjunctive mood where appropriate
      if (this.needsSpanishSubjunctive(spanish, varName)) {
        issues.push({
          type: 'subjunctive_mood',
          variable: varName,
          message:
            'Consider using Spanish subjunctive mood for uncertainty/doubt',
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
      const spanish = this.spanishTranslations[english];
      if (!spanish) continue;

      const context = templateData.context;
      if (context && context.primary_ui_type === 'title') {
        const issues = this.checkSpanishTitle(english, spanish);
        if (issues.length > 0) {
          titleIssues.push({
            english,
            spanish,
            issues,
            locations: templateData.description,
          });
        }
      }
    }

    return titleIssues;
  }

  // Check Spanish title quality
  checkSpanishTitle(english, spanish) {
    const issues = [];

    // Check capitalization (Spanish uses sentence case)
    if (this.hasInappropriateSpanishCapitalization(spanish)) {
      issues.push({
        type: 'capitalization',
        message: 'Spanish titles typically use sentence case, not title case',
        severity: 'low',
      });
    }

    // Check for appropriate Spanish terminology
    if (this.shouldUseNativeSpanishTerms(english, spanish)) {
      issues.push({
        type: 'terminology',
        message:
          'Consider using native Spanish terminology instead of Anglicisms',
        severity: 'medium',
      });
    }

    return issues;
  }

  // Spanish-specific helper methods
  hasAppropriateSpanishVerb(english, spanish) {
    // Check for Spanish imperative forms
    const spanishImperativePatterns = [
      /ar$/,
      /er$/,
      /ir$/, // Infinitive endings
      /e$/,
      /a$/, // Imperative endings
      /ad$/,
      /ed$/,
      /id$/, // Plural imperative endings
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
      // Check for common Spanish action verbs
      const commonActionVerbs = [
        'agregar',
        'guardar',
        'eliminar',
        'crear',
        'actualizar',
        'enviar',
        'cancelar',
      ];
      return (
        commonActionVerbs.some((verb) =>
          spanish.toLowerCase().includes(verb),
        ) ||
        spanishImperativePatterns.some((pattern) =>
          pattern.test(spanish.toLowerCase()),
        )
      );
    }

    return true;
  }

  hasInconsistentSpanishFormality(spanish) {
    // Check for mixed usted/tú usage
    const formalPatterns = ['usted', 'ustedes', 'su', 'sus'];
    const informalPatterns = ['tú', 'tu', 'tus', 'vosotros'];

    const hasFormal = formalPatterns.some((pattern) =>
      spanish.toLowerCase().includes(pattern),
    );
    const hasInformal = informalPatterns.some((pattern) =>
      spanish.toLowerCase().includes(pattern),
    );

    return hasFormal && hasInformal;
  }

  hasProperSpanishGenderAgreement(spanish) {
    // Basic check for gender agreement issues

    // Look for obvious gender disagreement patterns
    const mismatchPatterns = [
      /la\s+\w+[oa]$/, // la + masculine ending
      /el\s+\w+[ae]$/, // el + feminine ending
      /un\s+\w+a$/, // un + feminine ending
      /una\s+\w+o$/, // una + masculine ending
    ];

    return !mismatchPatterns.some((pattern) =>
      pattern.test(spanish.toLowerCase()),
    );
  }

  hasMissingAccents(spanish) {
    // Check for words that commonly need accents
    const accentWords = {
      computacion: 'computación',
      informacion: 'información',
      configuracion: 'configuración',
      administracion: 'administración',
      creacion: 'creación',
      mas: 'más',
      tambien: 'también',
    };

    for (const [wrong, correct] of Object.entries(accentWords)) {
      if (spanish.toLowerCase().includes(wrong) && !spanish.includes(correct)) {
        return true;
      }
    }
    return false;
  }

  needsReflexivePronouns(english, spanish) {
    // Check for verbs that commonly need reflexive pronouns in Spanish
    const reflexiveVerbs = [
      'login',
      'register',
      'connect',
      'disconnect',
      'change',
    ];
    const spanishReflexive = ['se', 'me', 'te', 'nos', 'os'];

    if (reflexiveVerbs.some((verb) => english.toLowerCase().includes(verb))) {
      return !spanishReflexive.some((pronoun) =>
        spanish.toLowerCase().includes(pronoun),
      );
    }
    return false;
  }

  hasProperSpanishNumberAgreement(spanish, varName) {
    const numberVar = `{${varName}}`;
    if (spanish.includes(numberVar)) {
      // Look for proper plural agreement patterns
      const pluralContext = spanish.substring(spanish.indexOf(numberVar));
      return (
        pluralContext.match(/\{[^}]+\}\s+\w+(s|es)\b/) !== null ||
        spanish.includes('uno') ||
        spanish.includes('una')
      ); // Singular forms
    }
    return true;
  }

  needsSpanishGenderAgreement(spanish, varName) {
    const numberVar = `{${varName}}`;
    // Check if variable appears in context that needs gender agreement
    return (
      spanish.includes(numberVar) &&
      spanish.match(/\s(el|la|un|una|este|esta|ese|esa)\s/)
    );
  }

  needsSpanishSubjunctive(spanish, varName) {
    // Check for contexts where subjunctive might be needed
    const subjunctiveMarkers = ['que', 'si', 'cuando', 'aunque', 'para que'];
    return (
      subjunctiveMarkers.some((marker) => spanish.includes(marker)) &&
      spanish.includes(`{${varName}}`)
    );
  }

  hasAppropriateSpanishFormality(spanish) {
    // Check for formal language markers (usted form)
    const formalMarkers = ['usted', 'ustedes', 'por favor', 'disculpe'];
    return formalMarkers.some((marker) =>
      spanish.toLowerCase().includes(marker),
    );
  }

  isSpanishErrorTooAbrupt(spanish) {
    // Check if error message is too abrupt
    const abruptPatterns = ['error', 'no se puede', 'prohibido', 'inválido'];
    return abruptPatterns.some(
      (pattern) =>
        spanish.toLowerCase().includes(pattern) &&
        !spanish.includes('por favor') &&
        !spanish.includes('disculpe'),
    );
  }

  shouldUseSpanishSubjunctiveInError(spanish) {
    // Check for error contexts where subjunctive might be appropriate
    const errorContexts = ['es posible que', 'puede que', 'es probable que'];
    return (
      spanish.toLowerCase().includes('error') &&
      !errorContexts.some((context) => spanish.includes(context))
    );
  }

  hasInappropriateSpanishCapitalization(spanish) {
    // Check for English-style title case in Spanish
    const words = spanish.split(' ');
    if (words.length > 1) {
      // Count capitalized words (excluding first word)
      const capitalizedCount = words.slice(1).filter(
        (word) =>
          word.length > 2 &&
          word[0] === word[0].toUpperCase() &&
          !['I', 'II', 'III', 'IV', 'V'].includes(word), // Roman numerals are OK
      ).length;
      return capitalizedCount > 1;
    }
    return false;
  }

  shouldUseNativeSpanishTerms(english, spanish) {
    // Check for excessive use of Anglicisms where native terms exist
    const anglicisms = ['email', 'software', 'hardware', 'login', 'website'];

    return anglicisms.some((anglicism) =>
      spanish.toLowerCase().includes(anglicism),
    );
  }

  // Generate improvement recommendations
  generateRecommendations() {
    return [
      '• Use formal "usted" form consistently in professional contexts',
      '• Ensure proper masculine/feminine gender agreement',
      '• Use correct accent marks (á, é, í, ó, ú, ñ)',
      '• Apply proper number-noun agreement for plurals',
      '• Consider reflexive pronouns for appropriate verbs',
      '• Use subjunctive mood for uncertainty and doubt',
      '• Include polite language markers (por favor, disculpe)',
      '• Use Spanish sentence case for titles',
      '• Replace Anglicisms with native Spanish terms',
      '• Ensure consistent formality level throughout interface',
    ];
  }

  // Main analysis function
  analyze() {
    console.log('🔍 Starting Spanish translation analysis...\n');

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

    console.log('\n📊 SPANISH TRANSLATION ANALYSIS REPORT');
    console.log('==================================================');
    console.log(`Total improvement opportunities found: ${totalIssues}\n`);

    // Button issues
    if (buttonIssues.length > 0) {
      console.log(`🔘 BUTTON TRANSLATION ISSUES (${buttonIssues.length})`);
      console.log('------------------------------');
      buttonIssues.slice(0, 5).forEach((item, index) => {
        console.log(`${index + 1}. "${item.english}" → "${item.spanish}"`);
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
        console.log(`${index + 1}. "${item.english}" → "${item.spanish}"`);
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
        console.log(`${index + 1}. "${item.english}" → "${item.spanish}"`);
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
    console.log('1. Ensure consistent use of formal "usted" form throughout');
    console.log('2. Fix gender agreement issues (masculine/feminine)');
    console.log('3. Add missing accent marks and correct existing ones');
    console.log('4. Review number-noun agreement for dynamic content');
    console.log('5. Replace Anglicisms with proper Spanish terminology');
  }
}

// Run the analysis
if (require.main === module) {
  const analyzer = new SpanishTranslationAnalyzer();
  analyzer.analyze();
}

module.exports = SpanishTranslationAnalyzer;
