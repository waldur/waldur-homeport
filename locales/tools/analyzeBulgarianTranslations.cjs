'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Bulgarian Translation Quality Analysis
 *
 * Analyzes Bulgarian translations against enhanced context to identify improvement opportunities
 * Focuses on Bulgarian language-specific grammar, style, and cultural adaptation
 */

class BulgarianTranslationAnalyzer {
  constructor() {
    this.enhancedTemplate = {};
    this.bulgarianTranslations = {};
    this.issues = [];
    this.recommendations = [];
  }

  // Load enhanced template and Bulgarian translations
  loadData() {
    try {
      const rootDir = path.join(__dirname, '../../');
      const enhancedContent = fs.readFileSync(
        path.join(rootDir, 'template.json'),
        'utf8',
      );
      this.enhancedTemplate = JSON.parse(enhancedContent);

      const bulgarianContent = fs.readFileSync(
        path.join(rootDir, 'locales/bg.json'),
        'utf8',
      );
      this.bulgarianTranslations = JSON.parse(bulgarianContent);

      console.log(
        `📚 Loaded ${Object.keys(this.enhancedTemplate).length} enhanced template entries`,
      );
      console.log(
        `🇧🇬 Loaded ${Object.keys(this.bulgarianTranslations).length} Bulgarian translations`,
      );
    } catch (error) {
      console.error(`Error loading data: ${error.message}`);
      process.exit(1);
    }
  }

  // Check if Bulgarian translation follows button text conventions
  analyzeButtonTranslations() {
    const buttonIssues = [];

    for (const [english, templateData] of Object.entries(
      this.enhancedTemplate,
    )) {
      const bulgarian = this.bulgarianTranslations[english];
      if (!bulgarian) continue;

      const context = templateData.context;
      if (
        context &&
        context.primary_ui_type &&
        context.primary_ui_type.includes('button')
      ) {
        const issues = this.checkButtonTextQuality(english, bulgarian, context);
        if (issues.length > 0) {
          buttonIssues.push({
            english,
            bulgarian,
            context: context.primary_ui_type,
            issues,
            locations: templateData.description,
          });
        }
      }
    }

    return buttonIssues;
  }

  // Check button text quality for Bulgarian
  checkButtonTextQuality(english, bulgarian, context) {
    const issues = [];

    // Check length - Bulgarian tends to be longer than English
    if (bulgarian.length > english.length * 2.5) {
      issues.push({
        type: 'length_concern',
        message: `Bulgarian text significantly longer than English (${bulgarian.length} vs ${english.length} chars)`,
        severity: 'medium',
      });
    }

    // Check for appropriate verb forms in action buttons (Bulgarian imperative)
    if (
      context.primary_ui_type === 'submit_button' ||
      context.primary_ui_type === 'action_button'
    ) {
      if (!this.hasAppropriateBulgarianVerb(english, bulgarian)) {
        issues.push({
          type: 'verb_form',
          message:
            'Consider using Bulgarian imperative verb form for action buttons',
          severity: 'low',
        });
      }
    }

    // Check for gender agreement
    if (this.hasInconsistentBulgarianGender(bulgarian)) {
      issues.push({
        type: 'gender_agreement',
        message:
          'Check Bulgarian gender agreement (masculine, feminine, neuter)',
        severity: 'medium',
      });
    }

    // Check for definite article usage
    if (this.hasIncorrectDefiniteArticle(bulgarian)) {
      issues.push({
        type: 'definite_article',
        message:
          'Check Bulgarian definite article postfix (-ът, -та, -то, -те)',
        severity: 'medium',
      });
    }

    // Check for formal/informal address consistency
    if (this.hasInconsistentFormality(bulgarian)) {
      issues.push({
        type: 'formality',
        message: 'Check formal/informal address consistency (Вие/ти)',
        severity: 'high',
      });
    }

    // Check for proper Cyrillic usage
    if (this.hasImproperCyrillic(bulgarian)) {
      issues.push({
        type: 'cyrillic_usage',
        message: 'Ensure proper Bulgarian Cyrillic script usage with ъ, ѝ',
        severity: 'high',
      });
    }

    return issues;
  }

  // Check variable handling in Bulgarian translations
  analyzeVariableHandling() {
    const variableIssues = [];

    for (const [english, templateData] of Object.entries(
      this.enhancedTemplate,
    )) {
      const bulgarian = this.bulgarianTranslations[english];
      if (!bulgarian) continue;

      const context = templateData.context;
      if (context && context.variables) {
        const issues = this.checkBulgarianVariableHandling(
          english,
          bulgarian,
          context.variables,
        );
        if (issues.length > 0) {
          variableIssues.push({
            english,
            bulgarian,
            variables: context.variables,
            issues,
            locations: templateData.description,
          });
        }
      }
    }

    return variableIssues;
  }

  // Check Bulgarian variable handling (cases, agreement, etc.)
  checkBulgarianVariableHandling(english, bulgarian, variables) {
    const issues = [];

    // Check for number-noun agreement issues
    for (const [varName, varInfo] of Object.entries(variables)) {
      if (varInfo.type === 'number') {
        if (!this.hasProperBulgarianNumberAgreement(bulgarian, varName)) {
          issues.push({
            type: 'number_agreement',
            variable: varName,
            message: 'Bulgarian number-noun agreement needs attention (1, 2+)',
            severity: 'high',
          });
        }
      }

      // Check for proper case usage with variables (remnants of case system)
      if (
        varInfo.type === 'string' &&
        this.needsBulgarianCaseAdjustment(bulgarian, varName)
      ) {
        issues.push({
          type: 'case_adjustment',
          variable: varName,
          message: 'Variable may need Bulgarian case remnant consideration',
          severity: 'medium',
        });
      }

      // Check for verb aspect consistency
      if (this.needsVerbAspectConsistency(bulgarian, varName)) {
        issues.push({
          type: 'verb_aspect',
          variable: varName,
          message:
            'Check Bulgarian verb aspect (perfective/imperfective) consistency',
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
      const bulgarian = this.bulgarianTranslations[english];
      if (!bulgarian) continue;

      const context = templateData.context;
      if (context && context.primary_ui_type === 'title') {
        const issues = this.checkBulgarianTitle(english, bulgarian);
        if (issues.length > 0) {
          titleIssues.push({
            english,
            bulgarian,
            issues,
            locations: templateData.description,
          });
        }
      }
    }

    return titleIssues;
  }

  // Check Bulgarian title quality
  checkBulgarianTitle(english, bulgarian) {
    const issues = [];

    // Check capitalization (Bulgarian uses sentence case)
    if (this.hasInappropriateBulgarianCapitalization(bulgarian)) {
      issues.push({
        type: 'capitalization',
        message: 'Bulgarian titles typically use sentence case, not title case',
        severity: 'low',
      });
    }

    // Check for appropriate Bulgarian terminology
    if (this.shouldUseNativeBulgarianTerms(english, bulgarian)) {
      issues.push({
        type: 'terminology',
        message:
          'Consider using native Bulgarian terminology instead of loanwords',
        severity: 'medium',
      });
    }

    return issues;
  }

  // Bulgarian-specific helper methods
  hasAppropriateBulgarianVerb(english, bulgarian) {
    // Check for Bulgarian imperative forms
    const bulgarianImperativePatterns = [
      /[ай]й$/,
      /[ете]те$/,
      /[ни]ни$/, // Common imperative endings
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
      return bulgarianImperativePatterns.some((pattern) =>
        pattern.test(bulgarian.toLowerCase()),
      );
    }

    return true; // Default to OK if not an action word
  }

  hasInconsistentBulgarianGender(bulgarian) {
    // Check for potential gender agreement issues
    // Look for adjective-noun mismatches (simplified check)
    return (
      bulgarian.match(/[аъ]т\s+[аеио]/) || bulgarian.match(/[аи]та\s+[ояе]/)
    );
  }

  hasIncorrectDefiniteArticle(bulgarian) {
    // Check for potential definite article issues
    const definitePatterns = [/-ът/, /-та/, /-то/, /-те/];
    if (definitePatterns.some((pattern) => pattern.test(bulgarian))) {
      // Basic check for context appropriateness
      return (
        bulgarian.match(/един.*-[тт][аеоъ]/) ||
        bulgarian.match(/някой.*-[тт][аеоъ]/)
      );
    }
    return false;
  }

  hasInconsistentFormality(bulgarian) {
    // Check for mixing formal and informal address
    return (
      (bulgarian.includes('Вие') && bulgarian.includes('ти')) ||
      (bulgarian.includes('вие') && bulgarian.includes('ти'))
    );
  }

  hasImproperCyrillic(bulgarian) {
    // Check for missing Bulgarian-specific Cyrillic letters or Latin characters
    return (
      /[a-zA-Z]/.test(bulgarian) ||
      (!/[ъь]/.test(bulgarian) && bulgarian.length > 10)
    ); // Should contain ъ or ь in longer texts
  }

  hasProperBulgarianNumberAgreement(bulgarian, varName) {
    // Check for Bulgarian number agreement (1 vs 2+)
    const numberVar = `{${varName}}`;
    if (bulgarian.includes(numberVar)) {
      // Look for patterns that might indicate missing plural handling
      return (
        bulgarian.includes('|') || // Indicates plural handling
        bulgarian.match(/\d+\s+[а-я]+а$/)
      ); // Simple plural check
    }
    return true;
  }

  needsBulgarianCaseAdjustment(bulgarian, varName) {
    const numberVar = `{${varName}}`;
    // Check if variable appears in context that might need case remnants
    return (
      bulgarian.includes(numberVar) && bulgarian.match(/\s(на|от|в|за|с|до)\s/)
    );
  }

  needsVerbAspectConsistency(bulgarian, varName) {
    // Check for verb aspect consistency in context
    return (
      bulgarian.includes(`{${varName}}`) &&
      (bulgarian.includes('ще') || bulgarian.includes('да'))
    );
  }

  shouldUseDiminutiveForms(bulgarian) {
    // Check if diminutive forms would be appropriate for softer tone
    const harshWords = ['грешка', 'проблем', 'неуспех'];
    return (
      harshWords.some((word) => bulgarian.includes(word)) &&
      !bulgarian.match(/-[чк][еоа]$/)
    );
  }

  hasInappropriateBulgarianCapitalization(bulgarian) {
    // Check for English-style title case in Bulgarian
    const words = bulgarian.split(' ');
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

  shouldUseNativeBulgarianTerms(english, bulgarian) {
    // Check for excessive use of loanwords where native terms exist
    const loanwords = ['компютър', 'интернет', 'имейл', 'файл', 'директория'];

    return loanwords.some((loanword) =>
      bulgarian.toLowerCase().includes(loanword),
    );
  }

  // Generate improvement recommendations
  generateRecommendations() {
    return [
      '• Use Bulgarian sentence case for titles instead of English title case',
      '• Ensure proper gender agreement (masculine, feminine, neuter)',
      '• Use appropriate definite article postfixes (-ът, -та, -то, -те)',
      '• Maintain consistent formal/informal address (Вие/ти)',
      '• Pay attention to verb aspect (perfective/imperfective) consistency',
      '• Use proper Bulgarian Cyrillic script with ъ, ѝ letters',
      '• Consider diminutive forms (-че, -ко, -ичко) for softer tone',
      '• Ensure proper number agreement (1 vs 2+)',
      '• Include polite language markers (моля, извинете)',
      '• Use Bulgarian imperative forms for action buttons',
      '• Adapt technical terminology to Bulgarian language patterns',
    ];
  }

  // Main analysis function
  analyze() {
    console.log('🔍 Starting Bulgarian translation analysis...\n');

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

    console.log('\n📊 BULGARIAN TRANSLATION ANALYSIS REPORT');
    console.log('==================================================');
    console.log(`Total improvement opportunities found: ${totalIssues}\n`);

    // Button issues
    if (buttonIssues.length > 0) {
      console.log(`🔘 BUTTON TRANSLATION ISSUES (${buttonIssues.length})`);
      console.log('------------------------------');
      buttonIssues.slice(0, 5).forEach((item, index) => {
        console.log(`${index + 1}. "${item.english}" → "${item.bulgarian}"`);
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
        console.log(`${index + 1}. "${item.english}" → "${item.bulgarian}"`);
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
        console.log(`${index + 1}. "${item.english}" → "${item.bulgarian}"`);
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
    console.log('1. Focus on gender agreement and definite article usage');
    console.log('2. Review verb aspect consistency throughout translations');
    console.log(
      '3. Ensure proper Cyrillic script usage with Bulgarian letters',
    );
    console.log('4. Standardize formal/informal address (Вие/ти)');
    console.log('6. Review number agreement for dynamic content (1 vs 2+)');
  }
}

// Run the analysis
if (require.main === module) {
  const analyzer = new BulgarianTranslationAnalyzer();
  analyzer.analyze();
}

module.exports = BulgarianTranslationAnalyzer;
