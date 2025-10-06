'use strict';

const fs = require('fs');
const path = require('path');

/**
 * French Translation Quality Analysis
 *
 * Analyzes French translations against enhanced context to identify improvement opportunities
 * Focuses on French language-specific grammar, style, and cultural adaptation
 */

class FrenchTranslationAnalyzer {
  constructor() {
    this.enhancedTemplate = {};
    this.frenchTranslations = {};
    this.issues = [];
    this.recommendations = [];
  }

  // Load enhanced template and French translations
  loadData() {
    try {
      const rootDir = path.join(__dirname, '../../');
      const enhancedContent = fs.readFileSync(
        path.join(rootDir, 'template.json'),
        'utf8',
      );
      this.enhancedTemplate = JSON.parse(enhancedContent);

      const frenchContent = fs.readFileSync(
        path.join(rootDir, 'locales/fr.json'),
        'utf8',
      );
      this.frenchTranslations = JSON.parse(frenchContent);

      console.log(
        `📚 Loaded ${Object.keys(this.enhancedTemplate).length} enhanced template entries`,
      );
      console.log(
        `🇫🇷 Loaded ${Object.keys(this.frenchTranslations).length} French translations`,
      );
    } catch (error) {
      console.error(`Error loading data: ${error.message}`);
      process.exit(1);
    }
  }

  // Check if French translation follows button text conventions
  analyzeButtonTranslations() {
    const buttonIssues = [];

    for (const [english, templateData] of Object.entries(
      this.enhancedTemplate,
    )) {
      const french = this.frenchTranslations[english];
      if (!french) continue;

      const context = templateData.context;
      if (
        context &&
        context.primary_ui_type &&
        context.primary_ui_type.includes('button')
      ) {
        const issues = this.checkButtonTextQuality(english, french, context);
        if (issues.length > 0) {
          buttonIssues.push({
            english,
            french,
            context: context.primary_ui_type,
            issues,
            locations: templateData.description,
          });
        }
      }
    }

    return buttonIssues;
  }

  // Check button text quality for French
  checkButtonTextQuality(english, french, context) {
    const issues = [];

    // Check length - French tends to be longer than English
    if (french.length > english.length * 2.3) {
      issues.push({
        type: 'length_concern',
        message: `French text significantly longer than English (${french.length} vs ${english.length} chars)`,
        severity: 'medium',
      });
    }

    // Check for appropriate verb forms in action buttons (French imperative)
    if (
      context.primary_ui_type === 'submit_button' ||
      context.primary_ui_type === 'action_button'
    ) {
      if (!this.hasAppropriateFrenchVerb(english, french)) {
        issues.push({
          type: 'verb_form',
          message:
            'Consider using French imperative verb form for action buttons',
          severity: 'low',
        });
      }
    }

    // Check for formal/informal address consistency
    if (this.hasInconsistentFrenchFormality(french)) {
      issues.push({
        type: 'formality_consistency',
        message:
          'Check vous/tu consistency - use formal "vous" in professional contexts',
        severity: 'high',
      });
    }

    // Check gender agreement
    if (!this.hasProperFrenchGenderAgreement(french)) {
      issues.push({
        type: 'gender_agreement',
        message: 'Check masculine/feminine gender agreement in French',
        severity: 'high',
      });
    }

    // Check for proper accent marks
    if (this.hasMissingFrenchAccents(french)) {
      issues.push({
        type: 'accent_marks',
        message:
          'Check for missing or incorrect accent marks (é, è, ê, à, ç, etc.)',
        severity: 'medium',
      });
    }

    // Check for elision usage
    if (this.needsFrenchElision(french)) {
      issues.push({
        type: 'elision',
        message: "Consider French elision (l', d', etc.) for better flow",
        severity: 'medium',
      });
    }

    // Check article usage
    if (!this.hasProperFrenchArticles(french)) {
      issues.push({
        type: 'article_usage',
        message: 'Check French article usage (le, la, les, un, une)',
        severity: 'medium',
      });
    }

    return issues;
  }

  // Check variable handling in French translations
  analyzeVariableHandling() {
    const variableIssues = [];

    for (const [english, templateData] of Object.entries(
      this.enhancedTemplate,
    )) {
      const french = this.frenchTranslations[english];
      if (!french) continue;

      const context = templateData.context;
      if (context && context.variables) {
        const issues = this.checkFrenchVariableHandling(
          english,
          french,
          context.variables,
        );
        if (issues.length > 0) {
          variableIssues.push({
            english,
            french,
            variables: context.variables,
            issues,
            locations: templateData.description,
          });
        }
      }
    }

    return variableIssues;
  }

  // Check French variable handling (gender agreement, plurals, etc.)
  checkFrenchVariableHandling(english, french, variables) {
    const issues = [];

    // Check for gender agreement with variables
    for (const [varName, varInfo] of Object.entries(variables)) {
      if (varInfo.type === 'number') {
        if (!this.hasProperFrenchNumberAgreement(french, varName)) {
          issues.push({
            type: 'number_agreement',
            variable: varName,
            message:
              'French number-noun agreement may need attention (singular/plural)',
            severity: 'high',
          });
        }
      }

      // Check for gender agreement with string variables
      if (
        varInfo.type === 'string' &&
        this.needsFrenchGenderAgreement(french, varName)
      ) {
        issues.push({
          type: 'gender_agreement',
          variable: varName,
          message:
            'Variable may need French gender agreement (masculine/feminine)',
          severity: 'high',
        });
      }

      // Check for liaison and enchainement
      if (this.needsFrenchLiaison(french, varName)) {
        issues.push({
          type: 'liaison',
          variable: varName,
          message: 'Consider French liaison rules for pronunciation flow',
          severity: 'low',
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
      const french = this.frenchTranslations[english];
      if (!french) continue;

      const context = templateData.context;
      if (context && context.primary_ui_type === 'title') {
        const issues = this.checkFrenchTitle(english, french);
        if (issues.length > 0) {
          titleIssues.push({
            english,
            french,
            issues,
            locations: templateData.description,
          });
        }
      }
    }

    return titleIssues;
  }

  // Check French title quality
  checkFrenchTitle(english, french) {
    const issues = [];

    // Check capitalization (French uses sentence case)
    if (this.hasInappropriateFrenchCapitalization(french)) {
      issues.push({
        type: 'capitalization',
        message: 'French titles typically use sentence case, not title case',
        severity: 'low',
      });
    }

    // Check for appropriate French terminology
    if (this.shouldUseNativeFrenchTerms(english, french)) {
      issues.push({
        type: 'terminology',
        message:
          'Consider using native French terminology instead of Anglicisms',
        severity: 'medium',
      });
    }

    return issues;
  }

  // French-specific helper methods
  hasAppropriateFrenchVerb(english, french) {
    // Check for French imperative forms
    const frenchImperativePatterns = [
      /er$/,
      /ir$/,
      /re$/, // Infinitive endings
      /ez$/,
      /ons$/, // Imperative endings
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
      // Check for common French action verbs
      const commonActionVerbs = [
        'ajouter',
        'sauvegarder',
        'supprimer',
        'créer',
        'mettre à jour',
        'envoyer',
        'annuler',
      ];
      return (
        commonActionVerbs.some((verb) => french.toLowerCase().includes(verb)) ||
        frenchImperativePatterns.some((pattern) =>
          pattern.test(french.toLowerCase()),
        )
      );
    }

    return true;
  }

  hasInconsistentFrenchFormality(french) {
    // Check for mixed vous/tu usage
    const formalPatterns = ['vous', 'votre', 'vos'];
    const informalPatterns = ['tu', 'ton', 'ta', 'tes'];

    const hasFormal = formalPatterns.some((pattern) =>
      french.toLowerCase().includes(pattern),
    );
    const hasInformal = informalPatterns.some((pattern) =>
      french.toLowerCase().includes(pattern),
    );

    return hasFormal && hasInformal;
  }

  hasProperFrenchGenderAgreement(french) {
    // Basic check for gender agreement issues

    // Look for obvious gender disagreement patterns
    const mismatchPatterns = [
      /la\s+\w+eur$/, // la + masculine -eur ending
      /le\s+\w+tion$/, // le + feminine -tion ending
      /un\s+\w+e$/, // un + likely feminine ending
      /une\s+\w+ment$/, // une + masculine -ment ending
    ];

    return !mismatchPatterns.some((pattern) =>
      pattern.test(french.toLowerCase()),
    );
  }

  hasMissingFrenchAccents(french) {
    // Check for words that commonly need accents
    const accentWords = {
      cree: 'créé',
      eleve: 'élevé',
      preference: 'préférence',
      connexion: 'connexion', // already correct
      pres: 'près',
      ou: 'où',
      deja: 'déjà',
      grace: 'grâce',
    };

    for (const [wrong, correct] of Object.entries(accentWords)) {
      if (french.toLowerCase().includes(wrong) && !french.includes(correct)) {
        return true;
      }
    }
    return false;
  }

  needsFrenchElision(french) {
    // Check for missing elision opportunities
    const elisionPatterns = [
      /le [aeiouhy]/i, // le + vowel should be l'
      /la [aeiouhy]/i, // la + vowel should be l'
      /de [aeiouhy]/i, // de + vowel should be d'
      /que [aeiouhy]/i, // que + vowel should be qu'
      /ne [aeiouhy]/i, // ne + vowel should be n'
    ];

    return elisionPatterns.some((pattern) => pattern.test(french));
  }

  hasProperFrenchArticles(french) {
    // Basic check for article agreement

    // Look for common article errors
    const articleErrors = [
      /le\s+[aeiouhy]/i, // le before vowel (should be l')
      /la\s+[aeiouhy]/i, // la before vowel (should be l')
    ];

    return !articleErrors.some((pattern) => pattern.test(french));
  }

  hasProperFrenchNumberAgreement(french, varName) {
    const numberVar = `{${varName}}`;
    if (french.includes(numberVar)) {
      // Look for proper plural agreement patterns
      const pluralContext = french.substring(french.indexOf(numberVar));
      return (
        pluralContext.match(/\{[^}]+\}\s+\w+(s|x)\b/) !== null ||
        french.includes('un') ||
        french.includes('une')
      ); // Singular forms
    }
    return true;
  }

  needsFrenchGenderAgreement(french, varName) {
    const numberVar = `{${varName}}`;
    // Check if variable appears in context that needs gender agreement
    return (
      french.includes(numberVar) &&
      french.match(/\s(le|la|un|une|ce|cette|mon|ma|ton|ta|son|sa)\s/)
    );
  }

  needsFrenchLiaison(french, varName) {
    // Check for contexts where liaison might be important
    const numberVar = `{${varName}}`;
    if (french.includes(numberVar)) {
      const context = french.substring(
        french.indexOf(numberVar) - 10,
        french.indexOf(numberVar) + 20,
      );
      return context.match(/[aeiouhy]\s+[aeiouhy]/i) !== null;
    }
    return false;
  }

  hasAppropriateFrenchFormality(french) {
    // Check for formal language markers (vous form)
    const formalMarkers = ['vous', 'votre', "s'il vous plaît", 'veuillez'];
    return formalMarkers.some((marker) =>
      french.toLowerCase().includes(marker),
    );
  }

  isFrenchErrorTooAbrupt(french) {
    // Check if error message is too abrupt
    const abruptPatterns = ['erreur', 'impossible', 'interdit', 'invalide'];
    return abruptPatterns.some(
      (pattern) =>
        french.toLowerCase().includes(pattern) &&
        !french.includes("s'il vous plaît") &&
        !french.includes('veuillez') &&
        !french.includes('désolé'),
    );
  }

  hasProperFrenchNegation(french) {
    // Check for proper French negation structure
    if (french.includes('ne') || french.includes("n'")) {
      // Look for the second part of negation
      const negationParts = [
        'pas',
        'plus',
        'jamais',
        'rien',
        'personne',
        'aucun',
      ];
      return negationParts.some((part) => french.includes(part));
    }
    return true; // No negation found, so it's OK
  }

  hasInappropriateFrenchCapitalization(french) {
    // Check for English-style title case in French
    const words = french.split(' ');
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

  shouldUseNativeFrenchTerms(english, french) {
    // Check for excessive use of Anglicisms where native terms exist
    const anglicisms = [
      'email',
      'software',
      'hardware',
      'login',
      'website',
      'download',
    ];

    return anglicisms.some((anglicism) =>
      french.toLowerCase().includes(anglicism),
    );
  }

  // Generate improvement recommendations
  generateRecommendations() {
    return [
      '• Use formal "vous" form consistently in professional contexts',
      '• Ensure proper masculine/feminine gender agreement',
      '• Use correct accent marks (é, è, ê, à, ç, etc.)',
      "• Apply French elision rules (l', d', qu', n')",
      '• Check article usage and agreement (le, la, les, un, une)',
      '• Use proper French negation structure (ne...pas)',
      '• Apply liaison rules for better pronunciation flow',
      "• Include polite language markers (s'il vous plaît, veuillez)",
      '• Use French sentence case for titles',
      '• Replace Anglicisms with native French terms',
    ];
  }

  // Main analysis function
  analyze() {
    console.log('🔍 Starting French translation analysis...\n');

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

    console.log('\n📊 FRENCH TRANSLATION ANALYSIS REPORT');
    console.log('==================================================');
    console.log(`Total improvement opportunities found: ${totalIssues}\n`);

    // Button issues
    if (buttonIssues.length > 0) {
      console.log(`🔘 BUTTON TRANSLATION ISSUES (${buttonIssues.length})`);
      console.log('------------------------------');
      buttonIssues.slice(0, 5).forEach((item, index) => {
        console.log(`${index + 1}. "${item.english}" → "${item.french}"`);
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
        console.log(`${index + 1}. "${item.english}" → "${item.french}"`);
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
        console.log(`${index + 1}. "${item.english}" → "${item.french}"`);
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
    console.log('1. Ensure consistent use of formal "vous" form throughout');
    console.log('2. Fix gender agreement issues (masculine/feminine)');
    console.log('3. Add missing accent marks and apply elision rules');
    console.log('4. Review article usage and agreement patterns');
    console.log('5. Replace Anglicisms with proper French terminology');
  }
}

// Run the analysis
if (require.main === module) {
  const analyzer = new FrenchTranslationAnalyzer();
  analyzer.analyze();
}

module.exports = FrenchTranslationAnalyzer;
