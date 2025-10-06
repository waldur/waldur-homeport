'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Slovenian Translation Quality Analysis
 *
 * Analyzes Slovenian translations against enhanced context to identify improvement opportunities
 * Focuses on Slovenian language-specific grammar, style, and cultural adaptation
 */

class SlovenianTranslationAnalyzer {
  constructor() {
    this.enhancedTemplate = {};
    this.slovenianTranslations = {};
    this.issues = [];
    this.recommendations = [];
  }

  // Load enhanced template and Slovenian translations
  loadData() {
    try {
      const rootDir = path.join(__dirname, '../../');
      const enhancedContent = fs.readFileSync(
        path.join(rootDir, 'template.json'),
        'utf8',
      );
      this.enhancedTemplate = JSON.parse(enhancedContent);

      const slovenianContent = fs.readFileSync(
        path.join(rootDir, 'locales/sl.json'),
        'utf8',
      );
      this.slovenianTranslations = JSON.parse(slovenianContent);

      console.log(
        `📚 Loaded ${Object.keys(this.enhancedTemplate).length} enhanced template entries`,
      );
      console.log(
        `🇸🇮 Loaded ${Object.keys(this.slovenianTranslations).length} Slovenian translations`,
      );
    } catch (error) {
      console.error(`Error loading data: ${error.message}`);
      process.exit(1);
    }
  }

  // Check if Slovenian translation follows button text conventions
  analyzeButtonTranslations() {
    const buttonIssues = [];

    for (const [english, templateData] of Object.entries(
      this.enhancedTemplate,
    )) {
      const slovenian = this.slovenianTranslations[english];
      if (!slovenian) continue;

      const context = templateData.context;
      if (
        context &&
        context.primary_ui_type &&
        context.primary_ui_type.includes('button')
      ) {
        const issues = this.checkButtonTextQuality(english, slovenian, context);
        if (issues.length > 0) {
          buttonIssues.push({
            english,
            slovenian,
            context: context.primary_ui_type,
            issues,
            locations: templateData.description,
          });
        }
      }
    }

    return buttonIssues;
  }

  // Check button text quality for Slovenian
  checkButtonTextQuality(english, slovenian, context) {
    const issues = [];

    // Check length - Slovenian tends to be longer than English
    if (slovenian.length > english.length * 2.8) {
      issues.push({
        type: 'length_concern',
        message: `Slovenian text significantly longer than English (${slovenian.length} vs ${english.length} chars)`,
        severity: 'medium',
      });
    }

    // Check for appropriate verb forms in action buttons (Slovenian imperative)
    if (
      context.primary_ui_type === 'submit_button' ||
      context.primary_ui_type === 'action_button'
    ) {
      if (!this.hasAppropriateSlovenianVerb(english, slovenian)) {
        issues.push({
          type: 'verb_form',
          message:
            'Consider using Slovenian imperative verb form for action buttons',
          severity: 'low',
        });
      }
    }

    // Check for case usage (6 cases: nominative, genitive, dative, accusative, locative, instrumental)
    if (this.hasInconsistentSlovenianCase(slovenian)) {
      issues.push({
        type: 'case_consistency',
        message:
          'Check Slovenian case usage (6 cases) - ensure consistency with context',
        severity: 'high',
      });
    }

    // Check for gender agreement (masculine, feminine, neuter)
    if (this.hasInconsistentSlovenianGender(slovenian)) {
      issues.push({
        type: 'gender_agreement',
        message:
          'Check Slovenian gender agreement (masculine, feminine, neuter)',
        severity: 'medium',
      });
    }

    // Check for dual number forms (unique to Slovenian)
    if (this.needsDualNumberForms(slovenian)) {
      issues.push({
        type: 'dual_number',
        message: 'Consider Slovenian dual number forms for pairs/two items',
        severity: 'medium',
      });
    }

    // Check for formal/informal address consistency
    if (this.hasInconsistentFormality(slovenian)) {
      issues.push({
        type: 'formality',
        message: 'Check formal/informal address consistency (vi/ti)',
        severity: 'high',
      });
    }

    // Check for proper diacriticals (č, š, ž)
    if (this.hasMissingDiacriticals(slovenian)) {
      issues.push({
        type: 'diacriticals',
        message: 'Ensure proper Slovenian diacriticals (č, š, ž)',
        severity: 'high',
      });
    }

    return issues;
  }

  // Check variable handling in Slovenian translations
  analyzeVariableHandling() {
    const variableIssues = [];

    for (const [english, templateData] of Object.entries(
      this.enhancedTemplate,
    )) {
      const slovenian = this.slovenianTranslations[english];
      if (!slovenian) continue;

      const context = templateData.context;
      if (context && context.variables) {
        const issues = this.checkSlovenianVariableHandling(
          english,
          slovenian,
          context.variables,
        );
        if (issues.length > 0) {
          variableIssues.push({
            english,
            slovenian,
            variables: context.variables,
            issues,
            locations: templateData.description,
          });
        }
      }
    }

    return variableIssues;
  }

  // Check Slovenian variable handling (cases, dual, agreement, etc.)
  checkSlovenianVariableHandling(english, slovenian, variables) {
    const issues = [];

    // Check for number-noun agreement issues (1, 2, 3-4, 5+)
    for (const [varName, varInfo] of Object.entries(variables)) {
      if (varInfo.type === 'number') {
        if (!this.hasProperSlovenianNumberAgreement(slovenian, varName)) {
          issues.push({
            type: 'number_agreement',
            variable: varName,
            message:
              'Slovenian number-noun agreement needs attention (1, 2, 3-4, 5+)',
            severity: 'high',
          });
        }

        // Check for dual number handling
        if (!this.hasDualNumberHandling(slovenian, varName)) {
          issues.push({
            type: 'dual_number_handling',
            variable: varName,
            message: 'Consider Slovenian dual number forms for count = 2',
            severity: 'medium',
          });
        }
      }

      // Check for proper case usage with variables
      if (
        varInfo.type === 'string' &&
        this.needsSlovenianCaseAdjustment(slovenian, varName)
      ) {
        issues.push({
          type: 'case_adjustment',
          variable: varName,
          message: 'Variable may need Slovenian case inflection in context',
          severity: 'high',
        });
      }

      // Check for verb aspect consistency
      if (this.needsVerbAspectConsistency(slovenian, varName)) {
        issues.push({
          type: 'verb_aspect',
          variable: varName,
          message:
            'Check Slovenian verb aspect (perfective/imperfective) consistency',
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
      const slovenian = this.slovenianTranslations[english];
      if (!slovenian) continue;

      const context = templateData.context;
      if (context && context.primary_ui_type === 'title') {
        const issues = this.checkSlovenianTitle(english, slovenian);
        if (issues.length > 0) {
          titleIssues.push({
            english,
            slovenian,
            issues,
            locations: templateData.description,
          });
        }
      }
    }

    return titleIssues;
  }

  // Check Slovenian title quality
  checkSlovenianTitle(english, slovenian) {
    const issues = [];

    // Check capitalization (Slovenian uses sentence case)
    if (this.hasInappropriateSlovenianCapitalization(slovenian)) {
      issues.push({
        type: 'capitalization',
        message: 'Slovenian titles typically use sentence case, not title case',
        severity: 'low',
      });
    }

    // Check for appropriate Slovenian terminology
    if (this.shouldUseNativeSlovenianTerms(english, slovenian)) {
      issues.push({
        type: 'terminology',
        message:
          'Consider using native Slovenian terminology instead of loanwords',
        severity: 'medium',
      });
    }

    return issues;
  }

  // Slovenian-specific helper methods
  hasAppropriateSlovenianVerb(english, slovenian) {
    // Check for Slovenian imperative forms
    const slovenianImperativePatterns = [
      /[ij]$/,
      /[ite]te$/,
      /[imo]mo$/, // Common imperative endings
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
      return slovenianImperativePatterns.some((pattern) =>
        pattern.test(slovenian.toLowerCase()),
      );
    }

    return true; // Default to OK if not an action word
  }

  hasInconsistentSlovenianCase(slovenian) {
    // Check for potential case inconsistencies (simplified)
    // Look for prepositions that require specific cases
    const casePatterns = [
      /\s(z|s)\s[^aeiou]/i, // z/s + instrumental should end in consonant
      /\s(v|na)\s.*[aei]$/i, // v/na + locative should end in -i/-e
      /\s(za|brez)\s.*[aeo]$/i, // za/brez + accusative/genitive
    ];

    return casePatterns.some((pattern) => pattern.test(slovenian));
  }

  hasInconsistentSlovenianGender(slovenian) {
    // Check for potential gender agreement issues
    // Look for adjective-noun mismatches (simplified check)
    return slovenian.match(/[iaeo]\s+[aeo]/) && !slovenian.match(/[ei]\s+[ei]/);
  }

  needsDualNumberForms(slovenian) {
    // Check if dual forms might be appropriate
    return (
      slovenian.includes('2') ||
      slovenian.includes('dva') ||
      slovenian.includes('dve') ||
      slovenian.match(/\b(oba|obe)\b/)
    );
  }

  hasInconsistentFormality(slovenian) {
    // Check for mixing formal and informal address
    return (
      (slovenian.includes('vi ') && slovenian.includes('ti ')) ||
      (slovenian.includes('Vi ') && slovenian.includes('ti '))
    );
  }

  hasMissingDiacriticals(slovenian) {
    // Check for words that might need diacriticals
    const wordsNeedingDiacriticals = ['ze', 'se', 'ce', 'ze', 'cas', 'ves'];
    return wordsNeedingDiacriticals.some(
      (word) =>
        slovenian.toLowerCase().includes(word) &&
        !slovenian.includes(
          word.replace('c', 'č').replace('s', 'š').replace('z', 'ž'),
        ),
    );
  }

  hasProperSlovenianNumberAgreement(slovenian, varName) {
    // Check for Slovenian number agreement (1, 2, 3-4, 5+)
    const numberVar = `{${varName}}`;
    if (slovenian.includes(numberVar)) {
      // Look for patterns that might indicate proper plural/dual handling
      return (
        slovenian.includes('|') || // Indicates plural handling
        slovenian.match(/\{.*\}\s*\|\s*\{.*\}/)
      ); // Dual/plural forms
    }
    return true;
  }

  hasDualNumberHandling(slovenian, varName) {
    // Check for dual number handling (specific to Slovenian)
    const numberVar = `{${varName}}`;
    if (slovenian.includes(numberVar)) {
      // Look for dual-specific patterns
      return (
        slovenian.includes('dva') ||
        slovenian.includes('dve') ||
        slovenian.match(/\{.*2.*\}/)
      );
    }
    return true;
  }

  needsSlovenianCaseAdjustment(slovenian, varName) {
    const numberVar = `{${varName}}`;
    // Check if variable appears in context that requires specific case
    return (
      slovenian.includes(numberVar) &&
      slovenian.match(/\s(z|s|v|na|za|brez|od|do|pri|po)\s/)
    );
  }

  needsVerbAspectConsistency(slovenian, varName) {
    // Check for verb aspect consistency in context
    return (
      slovenian.includes(`{${varName}}`) &&
      (slovenian.includes('bo') ||
        slovenian.includes('je') ||
        slovenian.includes('bi'))
    );
  }

  shouldUseDiminutiveForms(slovenian) {
    // Check if diminutive forms would be appropriate for softer tone
    const harshWords = ['napaka', 'problem', 'neuspeh'];
    return (
      harshWords.some((word) => slovenian.includes(word)) &&
      !slovenian.match(/-[čk][aeio]$/)
    );
  }

  hasInappropriateSlovenianCapitalization(slovenian) {
    // Check for English-style title case in Slovenian
    const words = slovenian.split(' ');
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

  shouldUseNativeSlovenianTerms(english, slovenian) {
    // Check for excessive use of loanwords where native terms exist
    const loanwords = ['kompjuter', 'internet', 'email', 'fajl', 'direktorij'];

    return loanwords.some((loanword) =>
      slovenian.toLowerCase().includes(loanword),
    );
  }

  // Generate improvement recommendations
  generateRecommendations() {
    return [
      '• Use Slovenian sentence case for titles instead of English title case',
      '• Ensure proper case usage (6 cases: nominative, genitive, dative, accusative, locative, instrumental)',
      '• Pay attention to gender agreement (masculine, feminine, neuter)',
      '• Use dual number forms for pairs/two items (unique Slovenian feature)',
      '• Maintain consistent formal/informal address (vi/ti)',
      '• Ensure proper diacriticals (č, š, ž) are used correctly',
      '• Consider diminutive forms (-ek, -ica, -če) for softer tone',
      '• Implement proper number agreement (1, 2, 3-4, 5+)',
      '• Include polite language markers (prosim, oprostite)',
      '• Use Slovenian imperative forms for action buttons',
      '• Check verb aspect (perfective/imperfective) consistency',
      '• Adapt technical terminology to native Slovenian terms',
    ];
  }

  // Main analysis function
  analyze() {
    console.log('🔍 Starting Slovenian translation analysis...\n');

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

    console.log('\n📊 SLOVENIAN TRANSLATION ANALYSIS REPORT');
    console.log('==================================================');
    console.log(`Total improvement opportunities found: ${totalIssues}\n`);

    // Button issues
    if (buttonIssues.length > 0) {
      console.log(`🔘 BUTTON TRANSLATION ISSUES (${buttonIssues.length})`);
      console.log('------------------------------');
      buttonIssues.slice(0, 5).forEach((item, index) => {
        console.log(`${index + 1}. "${item.english}" → "${item.slovenian}"`);
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
        console.log(`${index + 1}. "${item.english}" → "${item.slovenian}"`);
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
        console.log(`${index + 1}. "${item.english}" → "${item.slovenian}"`);
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
      '1. Focus on case system implementation (6 cases) and agreement',
    );
    console.log('2. Implement dual number forms for pairs/two items');
    console.log('3. Ensure proper diacriticals (č, š, ž) throughout');
    console.log('4. Review complex number agreement patterns (1, 2, 3-4, 5+)');
    console.log('5. Standardize formal/informal address (vi/ti)');
  }
}

// Run the analysis
if (require.main === module) {
  const analyzer = new SlovenianTranslationAnalyzer();
  analyzer.analyze();
}

module.exports = SlovenianTranslationAnalyzer;
