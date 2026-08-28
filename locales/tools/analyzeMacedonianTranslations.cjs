'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Macedonian Translation Quality Analysis
 *
 * Analyzes Macedonian translations against enhanced context to identify improvement opportunities
 * Focuses on Macedonian language-specific grammar, style, and cultural adaptation
 */

class MacedonianTranslationAnalyzer {
  constructor() {
    this.enhancedTemplate = {};
    this.macedonianTranslations = {};
    this.issues = [];
    this.recommendations = [];
  }

  // Load enhanced template and Macedonian translations
  loadData() {
    try {
      const rootDir = path.join(__dirname, '../../');
      const enhancedContent = fs.readFileSync(
        path.join(rootDir, 'template.json'),
        'utf8',
      );
      this.enhancedTemplate = JSON.parse(enhancedContent);

      const macedonianContent = fs.readFileSync(
        path.join(rootDir, 'locales/mk.json'),
        'utf8',
      );
      this.macedonianTranslations = JSON.parse(macedonianContent);

      console.log(
        `📚 Loaded ${Object.keys(this.enhancedTemplate).length} enhanced template entries`,
      );
      console.log(
        `🇲🇰 Loaded ${Object.keys(this.macedonianTranslations).length} Macedonian translations`,
      );
    } catch (error) {
      console.error(`Error loading data: ${error.message}`);
      process.exit(1);
    }
  }

  // Check if Macedonian translation follows button text conventions
  analyzeButtonTranslations() {
    const buttonIssues = [];

    for (const [english, templateData] of Object.entries(
      this.enhancedTemplate,
    )) {
      const macedonian = this.macedonianTranslations[english];
      if (!macedonian) continue;

      const context = templateData.context;
      if (
        context &&
        context.primary_ui_type &&
        context.primary_ui_type.includes('button')
      ) {
        const issues = this.checkButtonTextQuality(
          english,
          macedonian,
          context,
        );
        if (issues.length > 0) {
          buttonIssues.push({
            english,
            macedonian,
            context: context.primary_ui_type,
            issues,
            locations: templateData.description,
          });
        }
      }
    }

    return buttonIssues;
  }

  // Check button text quality for Macedonian
  checkButtonTextQuality(english, macedonian, context) {
    const issues = [];

    // Check length - Macedonian tends to be longer than English
    if (macedonian.length > english.length * 3.0) {
      issues.push({
        type: 'length_concern',
        message: `Macedonian text significantly longer than English (${macedonian.length} vs ${english.length} chars)`,
        severity: 'medium',
      });
    }

    // Macedonian has no infinitive, so action buttons take the imperative
    if (
      context.primary_ui_type === 'submit_button' ||
      context.primary_ui_type === 'action_button'
    ) {
      if (!this.hasAppropriateMacedonianVerb(english, macedonian)) {
        issues.push({
          type: 'verb_form',
          message:
            'Consider using the Macedonian imperative (-ај/-и/-ете) for action buttons — Macedonian has no infinitive',
          severity: 'low',
        });
      }
    }

    // Macedonian marks definiteness with a postposed article (-от/-та/-то/-те)
    if (this.hasDefinitenessIssues(english, macedonian)) {
      issues.push({
        type: 'definiteness',
        message:
          'Check the postposed definite article (-от/-та/-то/-те) — standalone UI labels are usually indefinite',
        severity: 'medium',
      });
    }

    // Check for gender agreement issues (masculine, feminine, neuter)
    if (this.hasGenderAgreementIssues(macedonian)) {
      issues.push({
        type: 'gender_agreement',
        message:
          'Check Macedonian gender agreement (masculine, feminine, neuter)',
        severity: 'medium',
      });
    }

    // Check that the text is actually in Cyrillic
    if (this.hasLatinContamination(english, macedonian)) {
      issues.push({
        type: 'script_usage',
        message:
          'Macedonian uses the Cyrillic alphabet — check for untranslated Latin text or transliteration',
        severity: 'high',
      });
    }

    return issues;
  }

  // Check variable handling in Macedonian translations
  analyzeVariableHandling() {
    const variableIssues = [];

    for (const [english, templateData] of Object.entries(
      this.enhancedTemplate,
    )) {
      const macedonian = this.macedonianTranslations[english];
      if (!macedonian) continue;

      const context = templateData.context;
      if (context && context.variables) {
        const issues = this.checkMacedonianVariableHandling(
          english,
          macedonian,
          context.variables,
        );
        if (issues.length > 0) {
          variableIssues.push({
            english,
            macedonian,
            variables: context.variables,
            issues,
            locations: templateData.description,
          });
        }
      }
    }

    return variableIssues;
  }

  // Check Macedonian variable handling (counted plural, definiteness, gender)
  checkMacedonianVariableHandling(english, macedonian, variables) {
    const issues = [];

    for (const [varName, varInfo] of Object.entries(variables)) {
      if (varInfo.type === 'number') {
        if (!this.hasProperMacedonianNumberAgreement(macedonian, varName)) {
          issues.push({
            type: 'number_agreement',
            variable: varName,
            message:
              'Macedonian counted form after a numeral differs from the plural (2 часа vs 5 часови)',
            severity: 'high',
          });
        }
      }

      // Macedonian lost the case system; prepositions carry the relation instead
      if (
        varInfo.type === 'string' &&
        this.needsMacedonianPreposition(macedonian, varName)
      ) {
        issues.push({
          type: 'preposition_usage',
          variable: varName,
          message:
            'Macedonian expresses relations with prepositions (на/од/во/за), not case endings — check the preposition around the variable',
          severity: 'medium',
        });
      }

      if (this.needsMacedonianGenderAgreement(macedonian, varName)) {
        issues.push({
          type: 'gender_agreement',
          variable: varName,
          message: 'Variable may need gender agreement in Macedonian context',
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
      const macedonian = this.macedonianTranslations[english];
      if (!macedonian) continue;

      const context = templateData.context;
      if (context && context.primary_ui_type === 'title') {
        const issues = this.checkMacedonianTitle(english, macedonian);
        if (issues.length > 0) {
          titleIssues.push({
            english,
            macedonian,
            issues,
            locations: templateData.description,
          });
        }
      }
    }

    return titleIssues;
  }

  // Check Macedonian title quality
  checkMacedonianTitle(english, macedonian) {
    const issues = [];

    // Check capitalization (Macedonian uses sentence case)
    if (this.hasInappropriateMacedonianCapitalization(macedonian)) {
      issues.push({
        type: 'capitalization',
        message:
          'Macedonian titles typically use sentence case, not title case',
        severity: 'low',
      });
    }

    // Check for appropriate Macedonian terminology
    if (this.shouldUseNativeMacedonianTerms(english, macedonian)) {
      issues.push({
        type: 'terminology',
        message:
          'Consider using native Macedonian terminology instead of Serbian/English loanwords',
        severity: 'medium',
      });
    }

    // Macedonian-specific letters that are easily lost in machine translation
    if (this.missingMacedonianLetters(macedonian)) {
      issues.push({
        type: 'letter_usage',
        message:
          'Check Macedonian-specific letters (ѓ, ќ, ѕ, ј, љ, њ, џ) — Serbian ђ/ћ are not Macedonian',
        severity: 'high',
      });
    }

    return issues;
  }

  // Macedonian-specific helper methods
  hasAppropriateMacedonianVerb(english, macedonian) {
    // Macedonian has no infinitive; buttons use the imperative or a verbal noun
    const macedonianVerbPatterns = [
      /ај$/,
      /и$/,
      /ете$/,
      /ајте$/, // imperative forms
      /ње$/,
      /ба$/, // verbal noun endings
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
      // Macedonian button labels lead with the verb ("Додај коментар"), so the
      // form to check is the first word, not the end of the whole label.
      const verb = macedonian.toLowerCase().split(/\s+/)[0];
      return macedonianVerbPatterns.some((pattern) => pattern.test(verb));
    }

    return true; // Default to OK if not an action word
  }

  hasDefinitenessIssues(english, macedonian) {
    // A bare English label ("Project", "Settings") normally maps onto an
    // indefinite Macedonian noun; a definite article on a one-word label is
    // usually a machine-translation artefact.
    const words = macedonian.trim().split(/\s+/);
    if (words.length !== 1 || /^the\s/i.test(english)) {
      return false;
    }
    return /(от|та|то|те|ов|ва|во|ве)$/.test(words[0].toLowerCase());
  }

  hasGenderAgreementIssues(macedonian) {
    // Check for potential gender agreement issues across the three genders
    const mismatchPatterns = [
      /\b\w+ки\s+\w+от\b/i, // feminine adjective with masculine definite noun
      /\b\w+иот\s+\w+а\b/i, // masculine definite adjective with feminine noun
      /\b\w+ото\s+\w+а\b/i, // neuter definite adjective with feminine noun
    ];

    return mismatchPatterns.some((pattern) => pattern.test(macedonian));
  }

  hasLatinContamination(english, macedonian) {
    // Technical tokens legitimately stay in Latin (API, URL, UUID, SSH...).
    // Flag only long Latin runs that look like untranslated prose.
    const latinRuns = macedonian.match(/[A-Za-z]{4,}/g) || [];
    return latinRuns.some(
      (run) =>
        run.length > 3 && !english.includes(run) && !/^[A-Z]+$/.test(run),
    );
  }

  missingMacedonianLetters(macedonian) {
    // Serbian/Croatian letters that do not exist in the Macedonian alphabet,
    // plus Latin digraphs left behind by transliteration.
    const foreignPatterns = [/[ђћ]/, /\bnj\b/i, /\blj\b/i, /\bdz\b/i];

    return foreignPatterns.some((pattern) => pattern.test(macedonian));
  }

  hasProperMacedonianNumberAgreement(macedonian, varName) {
    // Macedonian uses a distinct counted form after numerals (два часа,
    // пет часови), so a bare plural directly after the variable is suspect.
    const numberVar = `{${varName}}`;
    if (macedonian.includes(numberVar)) {
      return !macedonian.match(new RegExp(`${numberVar}\\s+\\w+(ови|еви)\\b`));
    }
    return true;
  }

  needsMacedonianPreposition(macedonian, varName) {
    const variablePattern = `{${varName}}`;
    // Macedonian is analytic: relations that other Slavic languages mark with
    // cases are carried by these prepositions instead.
    const prepositionContexts = [
      /\s(на|од|во|со|за|до|кон|по|при|без)\s/,
      /\s(околу|освен|поради|преку|според|помеѓу)\s/,
    ];

    return (
      macedonian.includes(variablePattern) &&
      prepositionContexts.some((pattern) => pattern.test(macedonian))
    );
  }

  needsMacedonianGenderAgreement(macedonian, varName) {
    const variablePattern = `{${varName}}`;
    // Check if variable appears with adjectives that need gender agreement
    return (
      macedonian.includes(variablePattern) &&
      macedonian.match(/\s(нов|стар|добар|лош|голем|мал)\s/)
    );
  }

  hasInappropriateMacedonianCapitalization(macedonian) {
    // Check for English-style title case in Macedonian
    const words = macedonian.split(' ');
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

  shouldUseNativeMacedonianTerms(english, macedonian) {
    // Serbianisms and raw transliterations where a standard Macedonian term exists
    const loanwords = [
      'компјутер',
      'фајл',
      'даунлоуд',
      'аплоуд',
      'сетинг',
      'извештај о',
    ];

    return loanwords.some((loanword) =>
      macedonian.toLowerCase().includes(loanword),
    );
  }

  // Generate improvement recommendations
  generateRecommendations() {
    return [
      '• Use Macedonian sentence case for titles instead of English title case',
      '• Prefer standard Macedonian terms over Serbianisms and raw transliterations',
      '• Use imperative forms (-ај/-и/-ете) for action buttons — Macedonian has no infinitive',
      '• Keep standalone UI labels indefinite; add -от/-та/-то/-те only when the referent is definite',
      '• Express relations with prepositions (на/од/во/за), not case endings',
      '• Ensure proper gender agreement (masculine, feminine, neuter)',
      '• Use the Macedonian alphabet correctly (ѓ, ќ, ѕ, ј, љ, њ, џ); ђ and ћ are Serbian, not Macedonian',
      '• Use the counted form after numerals (два часа) rather than the plural (пет часови)',
      '• Use the formal "Вие" form in professional contexts',
      '• Consider verb aspect usage (perfective/imperfective) for proper meaning',
      '• Include polite markers in error messages (ве молиме, за жал)',
    ];
  }

  // Main analysis function
  analyze() {
    console.log('🔍 Starting Macedonian translation analysis...\n');

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

    console.log('\n📊 MACEDONIAN TRANSLATION ANALYSIS REPORT');
    console.log('==================================================');
    console.log(`Total improvement opportunities found: ${totalIssues}\n`);

    // Button issues
    if (buttonIssues.length > 0) {
      console.log(`🔘 BUTTON TRANSLATION ISSUES (${buttonIssues.length})`);
      console.log('------------------------------');
      buttonIssues.slice(0, 5).forEach((item, index) => {
        console.log(`${index + 1}. "${item.english}" → "${item.macedonian}"`);
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
        console.log(`${index + 1}. "${item.english}" → "${item.macedonian}"`);
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
        console.log(`${index + 1}. "${item.english}" → "${item.macedonian}"`);
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
    console.log('1. Fix Latin contamination and non-Macedonian letters first');
    console.log('2. Review button text for Macedonian imperative forms');
    console.log(
      '3. Check definiteness — drop stray -от/-та/-то on bare labels',
    );
    console.log('4. Check counted forms after numerals');
    console.log(
      '5. Standardize title capitalization to Macedonian conventions',
    );
  }
}

// Run the analysis
if (require.main === module) {
  const analyzer = new MacedonianTranslationAnalyzer();
  analyzer.analyze();
}

module.exports = MacedonianTranslationAnalyzer;
