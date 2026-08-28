'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Albanian Translation Quality Analysis
 *
 * Analyzes Albanian translations against enhanced context to identify improvement opportunities
 * Focuses on Albanian language-specific grammar, style, and cultural adaptation
 */

class AlbanianTranslationAnalyzer {
  constructor() {
    this.enhancedTemplate = {};
    this.albanianTranslations = {};
    this.issues = [];
    this.recommendations = [];
  }

  // Load enhanced template and Albanian translations
  loadData() {
    try {
      const rootDir = path.join(__dirname, '../../');
      const enhancedContent = fs.readFileSync(
        path.join(rootDir, 'template.json'),
        'utf8',
      );
      this.enhancedTemplate = JSON.parse(enhancedContent);

      const albanianContent = fs.readFileSync(
        path.join(rootDir, 'locales/sq.json'),
        'utf8',
      );
      this.albanianTranslations = JSON.parse(albanianContent);

      console.log(
        `📚 Loaded ${Object.keys(this.enhancedTemplate).length} enhanced template entries`,
      );
      console.log(
        `🇦🇱 Loaded ${Object.keys(this.albanianTranslations).length} Albanian translations`,
      );
    } catch (error) {
      console.error(`Error loading data: ${error.message}`);
      process.exit(1);
    }
  }

  // Check if Albanian translation follows button text conventions
  analyzeButtonTranslations() {
    const buttonIssues = [];

    for (const [english, templateData] of Object.entries(
      this.enhancedTemplate,
    )) {
      const albanian = this.albanianTranslations[english];
      if (!albanian) continue;

      const context = templateData.context;
      if (
        context &&
        context.primary_ui_type &&
        context.primary_ui_type.includes('button')
      ) {
        const issues = this.checkButtonTextQuality(english, albanian, context);
        if (issues.length > 0) {
          buttonIssues.push({
            english,
            albanian,
            context: context.primary_ui_type,
            issues,
            locations: templateData.description,
          });
        }
      }
    }

    return buttonIssues;
  }

  // Check button text quality for Albanian
  checkButtonTextQuality(english, albanian, context) {
    const issues = [];

    // Check length - Albanian tends to be longer than English
    if (albanian.length > english.length * 3.0) {
      issues.push({
        type: 'length_concern',
        message: `Albanian text significantly longer than English (${albanian.length} vs ${english.length} chars)`,
        severity: 'medium',
      });
    }

    // Albanian action buttons take the second-person imperative
    if (
      context.primary_ui_type === 'submit_button' ||
      context.primary_ui_type === 'action_button'
    ) {
      if (!this.hasAppropriateAlbanianVerb(english, albanian)) {
        issues.push({
          type: 'verb_form',
          message:
            'Consider using the Albanian imperative (shto, ruaj, fshi) for action buttons',
          severity: 'low',
        });
      }
    }

    // Albanian marks definiteness with a suffixed article (-i/-u/-a/-ja/-t/-të)
    if (this.hasDefinitenessIssues(english, albanian)) {
      issues.push({
        type: 'definiteness',
        message:
          'Check the definite suffix (-i/-u/-a/-ja/-t/-të) — standalone UI labels are usually indefinite',
        severity: 'medium',
      });
    }

    // Check for gender agreement issues (masculine, feminine)
    if (this.hasGenderAgreementIssues(albanian)) {
      issues.push({
        type: 'gender_agreement',
        message:
          'Check Albanian gender agreement and the linking article (i/e/të/së)',
        severity: 'medium',
      });
    }

    // Check for proper diacritic usage
    if (this.missingAlbanianDiacritic(english, albanian)) {
      issues.push({
        type: 'diacritic_usage',
        message: 'Check Albanian diacritic usage (ë, ç)',
        severity: 'high',
      });
    }

    return issues;
  }

  // Check variable handling in Albanian translations
  analyzeVariableHandling() {
    const variableIssues = [];

    for (const [english, templateData] of Object.entries(
      this.enhancedTemplate,
    )) {
      const albanian = this.albanianTranslations[english];
      if (!albanian) continue;

      const context = templateData.context;
      if (context && context.variables) {
        const issues = this.checkAlbanianVariableHandling(
          english,
          albanian,
          context.variables,
        );
        if (issues.length > 0) {
          variableIssues.push({
            english,
            albanian,
            variables: context.variables,
            issues,
            locations: templateData.description,
          });
        }
      }
    }

    return variableIssues;
  }

  // Check Albanian variable handling (number agreement, definiteness, gender)
  checkAlbanianVariableHandling(english, albanian, variables) {
    const issues = [];

    for (const [varName, varInfo] of Object.entries(variables)) {
      if (varInfo.type === 'number') {
        if (!this.hasProperAlbanianNumberAgreement(albanian, varName)) {
          issues.push({
            type: 'number_agreement',
            variable: varName,
            message:
              'Albanian number-noun agreement may need attention (1 takes the singular, 2+ the plural)',
            severity: 'high',
          });
        }
      }

      // Albanian has 5 cases; the preposition selects the case of the noun
      if (
        varInfo.type === 'string' &&
        this.needsAlbanianCaseAdjustment(albanian, varName)
      ) {
        issues.push({
          type: 'case_adjustment',
          variable: varName,
          message:
            'Variable may need Albanian case inflection in grammatical context (5 cases)',
          severity: 'medium',
        });
      }

      if (this.needsAlbanianGenderAgreement(albanian, varName)) {
        issues.push({
          type: 'gender_agreement',
          variable: varName,
          message:
            'Variable may need gender agreement and a linking article in Albanian context',
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
      const albanian = this.albanianTranslations[english];
      if (!albanian) continue;

      const context = templateData.context;
      if (context && context.primary_ui_type === 'title') {
        const issues = this.checkAlbanianTitle(english, albanian);
        if (issues.length > 0) {
          titleIssues.push({
            english,
            albanian,
            issues,
            locations: templateData.description,
          });
        }
      }
    }

    return titleIssues;
  }

  // Check Albanian title quality
  checkAlbanianTitle(english, albanian) {
    const issues = [];

    // Check capitalization (Albanian uses sentence case)
    if (this.hasInappropriateAlbanianCapitalization(albanian)) {
      issues.push({
        type: 'capitalization',
        message: 'Albanian titles typically use sentence case, not title case',
        severity: 'low',
      });
    }

    // Check for appropriate Albanian terminology
    if (this.shouldUseNativeAlbanianTerms(english, albanian)) {
      issues.push({
        type: 'terminology',
        message:
          'Consider using standard Albanian terminology instead of English loanwords',
        severity: 'medium',
      });
    }

    // Gheg forms leaking into what should be standard (Tosk-based) Albanian
    if (this.hasNonStandardDialectForms(albanian)) {
      issues.push({
        type: 'dialect',
        message:
          'Check for Gheg forms — the UI should use standard (Tosk-based) Albanian',
        severity: 'medium',
      });
    }

    return issues;
  }

  // Albanian-specific helper methods
  hasAppropriateAlbanianVerb(english, albanian) {
    // Albanian imperatives are mostly the bare stem (shto, ruaj, fshi, krijo)
    // or take -o/-i/-ni; verbal nouns start with the "për të" particle.
    const albanianVerbPatterns = [
      /o$/,
      /i$/,
      /aj$/,
      /ni$/, // imperative forms
      /uaj$/,
      /ohu$/, // reflexive/derived imperatives
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
      // Albanian button labels lead with the verb ("Shto koment"), so the form
      // to check is the first word, not the end of the whole label.
      const verb = albanian.toLowerCase().split(/\s+/)[0];
      return albanianVerbPatterns.some((pattern) => pattern.test(verb));
    }

    return true; // Default to OK if not an action word
  }

  hasDefinitenessIssues(english, albanian) {
    // A bare English label ("Project", "Settings") normally maps onto an
    // indefinite Albanian noun; a definite suffix on a one-word label is
    // usually a machine-translation artefact.
    const words = albanian.trim().split(/\s+/);
    if (words.length !== 1 || /^the\s/i.test(english)) {
      return false;
    }
    return /(ja|të|it|ët)$/.test(words[0].toLowerCase());
  }

  hasGenderAgreementIssues(albanian) {
    // Albanian links adjectives to nouns with i/e/të/së, and the article must
    // agree with the noun's gender, number and case.
    const mismatchPatterns = [
      /\b\w+a\s+i\s+\w+/i, // feminine noun with masculine linking article
      /\b\w+i\s+e\s+\w+/i, // masculine noun with feminine linking article
      /\bi\s+i\s+/i, // duplicated linking article
    ];

    return mismatchPatterns.some((pattern) => pattern.test(albanian));
  }

  missingAlbanianDiacritic(english, albanian) {
    // Albanian text of any length almost always contains ë; its absence in a
    // longer string usually means the diacritics were stripped.
    if (albanian.length < 12 || english === albanian) {
      return false;
    }
    const strippedMarkers = [
      /\bne\b/i, // "në" written as "ne"
      /\bper\b/i, // "për" written as "per"
      /\bkete\b/i, // "këtë" written as "kete"
      /\bqe\b/i, // "që" written as "qe"
    ];

    return strippedMarkers.some((pattern) => pattern.test(albanian));
  }

  hasProperAlbanianNumberAgreement(albanian, varName) {
    // Albanian pluralisation is irregular; flag a variable followed directly
    // by what looks like an unpluralised singular noun.
    const numberVar = `{${varName}}`;
    if (albanian.includes(numberVar)) {
      return !albanian.match(new RegExp(`${numberVar}\\s+\\w+(im|esë)\\b`));
    }
    return true;
  }

  needsAlbanianCaseAdjustment(albanian, varName) {
    const variablePattern = `{${varName}}`;
    // Prepositions that select a specific case for the noun that follows
    const caseRequiringContexts = [
      /\s(në|nga|me|pa|për|te|tek|mbi|nën|prej)\s/,
      /\s(rreth|përveç|gjatë|sipas|ndaj|midis|ndërmjet)\s/,
    ];

    return (
      albanian.includes(variablePattern) &&
      caseRequiringContexts.some((pattern) => pattern.test(albanian))
    );
  }

  needsAlbanianGenderAgreement(albanian, varName) {
    const variablePattern = `{${varName}}`;
    // Check if variable appears with adjectives that need gender agreement
    return (
      albanian.includes(variablePattern) &&
      albanian.match(
        /\s(i\s+ri|e\s+re|i\s+vjetër|e\s+vjetër|i\s+madh|e\s+madhe)\s/,
      )
    );
  }

  hasInappropriateAlbanianCapitalization(albanian) {
    // Check for English-style title case in Albanian
    const words = albanian.split(' ');
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

  shouldUseNativeAlbanianTerms(english, albanian) {
    // Check for excessive use of loanwords where standard terms exist
    const loanwords = [
      'kompjuter',
      'fajll',
      'daunllodo',
      'apllodo',
      'sejvo',
      'setingse',
    ];

    return loanwords.some((loanword) =>
      albanian.toLowerCase().includes(loanword),
    );
  }

  hasNonStandardDialectForms(albanian) {
    // Gheg markers: the "me + verb" infinitive and nasal vowels written with â/û
    const ghegPatterns = [/\bme\s+\w+(ë|u)\b/i, /[âû]/];

    return ghegPatterns.some((pattern) => pattern.test(albanian));
  }

  // Generate improvement recommendations
  generateRecommendations() {
    return [
      '• Use Albanian sentence case for titles instead of English title case',
      '• Prefer standard Albanian terms over English loanwords when available',
      '• Use the imperative (shto, ruaj, fshi, krijo) for action buttons',
      '• Keep standalone UI labels indefinite; add -i/-u/-a/-ja only when the referent is definite',
      '• Pay attention to Albanian case agreement with variables (5 cases)',
      '• Ensure the linking article (i/e/të/së) agrees with the noun it modifies',
      '• Use proper Albanian diacritics (ë, ç) — never strip them',
      '• Check number agreement; Albanian plural formation is irregular',
      '• Use the formal "Ju" form in professional contexts',
      '• Write standard (Tosk-based) Albanian, not Gheg forms',
      '• Include polite markers in error messages (ju lutemi, na vjen keq)',
    ];
  }

  // Main analysis function
  analyze() {
    console.log('🔍 Starting Albanian translation analysis...\n');

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

    console.log('\n📊 ALBANIAN TRANSLATION ANALYSIS REPORT');
    console.log('==================================================');
    console.log(`Total improvement opportunities found: ${totalIssues}\n`);

    // Button issues
    if (buttonIssues.length > 0) {
      console.log(`🔘 BUTTON TRANSLATION ISSUES (${buttonIssues.length})`);
      console.log('------------------------------');
      buttonIssues.slice(0, 5).forEach((item, index) => {
        console.log(`${index + 1}. "${item.english}" → "${item.albanian}"`);
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
        console.log(`${index + 1}. "${item.english}" → "${item.albanian}"`);
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
        console.log(`${index + 1}. "${item.english}" → "${item.albanian}"`);
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
    console.log('1. Restore stripped diacritics (ë, ç) first');
    console.log('2. Review button text for Albanian imperative forms');
    console.log(
      '3. Check definiteness — drop stray -i/-u/-a/-ja on bare labels',
    );
    console.log(
      '4. Verify the linking article (i/e/të/së) agrees with its noun',
    );
    console.log('5. Standardize title capitalization to Albanian conventions');
  }
}

// Run the analysis
if (require.main === module) {
  const analyzer = new AlbanianTranslationAnalyzer();
  analyzer.analyze();
}

module.exports = AlbanianTranslationAnalyzer;
