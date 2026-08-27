'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Croatian Translation Quality Analysis
 *
 * Analyzes Croatian translations against enhanced context to identify improvement opportunities
 * Focuses on Croatian language-specific grammar, style, and cultural adaptation
 */

class CroatianTranslationAnalyzer {
  constructor() {
    this.enhancedTemplate = {};
    this.croatianTranslations = {};
    this.issues = [];
    this.recommendations = [];
  }

  // Load enhanced template and Croatian translations
  loadData() {
    try {
      const rootDir = path.join(__dirname, '../../');
      const enhancedContent = fs.readFileSync(
        path.join(rootDir, 'template.json'),
        'utf8',
      );
      this.enhancedTemplate = JSON.parse(enhancedContent);

      const croatianContent = fs.readFileSync(
        path.join(rootDir, 'locales/hr.json'),
        'utf8',
      );
      this.croatianTranslations = JSON.parse(croatianContent);

      console.log(
        `📚 Loaded ${Object.keys(this.enhancedTemplate).length} enhanced template entries`,
      );
      console.log(
        `🇭🇷 Loaded ${Object.keys(this.croatianTranslations).length} Croatian translations`,
      );
    } catch (error) {
      console.error(`Error loading data: ${error.message}`);
      process.exit(1);
    }
  }

  // Check if Croatian translation follows button text conventions
  analyzeButtonTranslations() {
    const buttonIssues = [];

    for (const [english, templateData] of Object.entries(
      this.enhancedTemplate,
    )) {
      const croatian = this.croatianTranslations[english];
      if (!croatian) continue;

      const context = templateData.context;
      if (
        context &&
        context.primary_ui_type &&
        context.primary_ui_type.includes('button')
      ) {
        const issues = this.checkButtonTextQuality(english, croatian, context);
        if (issues.length > 0) {
          buttonIssues.push({
            english,
            croatian,
            context: context.primary_ui_type,
            issues,
            locations: templateData.description,
          });
        }
      }
    }

    return buttonIssues;
  }

  // Check button text quality for Croatian
  checkButtonTextQuality(english, croatian, context) {
    const issues = [];

    // Check length - Croatian tends to be longer than English
    if (croatian.length > english.length * 3.0) {
      issues.push({
        type: 'length_concern',
        message: `Croatian text significantly longer than English (${croatian.length} vs ${english.length} chars)`,
        severity: 'medium',
      });
    }

    // Check for appropriate verb forms in action buttons (Croatian infinitive or imperative)
    if (
      context.primary_ui_type === 'submit_button' ||
      context.primary_ui_type === 'action_button'
    ) {
      if (!this.hasAppropriateCroatianVerb(english, croatian)) {
        issues.push({
          type: 'verb_form',
          message:
            'Consider using the Croatian imperative (-aj/-i/-ite) for action buttons',
          severity: 'low',
        });
      }
    }

    // Check for case consistency (Croatian has 7 cases)
    if (this.hasInconsistentCroatianCase(croatian)) {
      issues.push({
        type: 'case_consistency',
        message:
          'Check Croatian case usage - ensure consistency with grammatical context',
        severity: 'medium',
      });
    }

    // Check for gender agreement issues (masculine, feminine, neuter)
    if (this.hasGenderAgreementIssues(croatian)) {
      issues.push({
        type: 'gender_agreement',
        message:
          'Check Croatian gender agreement (masculine, feminine, neuter)',
        severity: 'medium',
      });
    }

    // Check for proper diacritic usage
    if (this.missingCroatianDiacritic(english, croatian)) {
      issues.push({
        type: 'diacritic_usage',
        message: 'Check Croatian diacritic usage (č, ć, dž, đ, š, ž)',
        severity: 'high',
      });
    }

    return issues;
  }

  // Check variable handling in Croatian translations
  analyzeVariableHandling() {
    const variableIssues = [];

    for (const [english, templateData] of Object.entries(
      this.enhancedTemplate,
    )) {
      const croatian = this.croatianTranslations[english];
      if (!croatian) continue;

      const context = templateData.context;
      if (context && context.variables) {
        const issues = this.checkCroatianVariableHandling(
          english,
          croatian,
          context.variables,
        );
        if (issues.length > 0) {
          variableIssues.push({
            english,
            croatian,
            variables: context.variables,
            issues,
            locations: templateData.description,
          });
        }
      }
    }

    return variableIssues;
  }

  // Check Croatian variable handling (cases, gender agreement, etc.)
  checkCroatianVariableHandling(english, croatian, variables) {
    const issues = [];

    // Check for number-noun agreement issues
    for (const [varName, varInfo] of Object.entries(variables)) {
      if (varInfo.type === 'number') {
        if (!this.hasProperCroatianNumberAgreement(croatian, varName)) {
          issues.push({
            type: 'number_agreement',
            variable: varName,
            message:
              'Croatian number-noun agreement may need attention (1, 2-4 paucal, 5+ genitive plural)',
            severity: 'high',
          });
        }
      }

      // Check for proper case usage with variables
      if (
        varInfo.type === 'string' &&
        this.needsCroatianCaseAdjustment(croatian, varName)
      ) {
        issues.push({
          type: 'case_adjustment',
          variable: varName,
          message:
            'Variable may need Croatian case inflection in grammatical context',
          severity: 'medium',
        });
      }

      // Check for gender agreement with variables
      if (this.needsCroatianGenderAgreement(croatian, varName)) {
        issues.push({
          type: 'gender_agreement',
          variable: varName,
          message: 'Variable may need gender agreement in Croatian context',
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
      const croatian = this.croatianTranslations[english];
      if (!croatian) continue;

      const context = templateData.context;
      if (context && context.primary_ui_type === 'title') {
        const issues = this.checkCroatianTitle(english, croatian);
        if (issues.length > 0) {
          titleIssues.push({
            english,
            croatian,
            issues,
            locations: templateData.description,
          });
        }
      }
    }

    return titleIssues;
  }

  // Check Croatian title quality
  checkCroatianTitle(english, croatian) {
    const issues = [];

    // Check capitalization (Croatian uses sentence case)
    if (this.hasInappropriateCroatianCapitalization(croatian)) {
      issues.push({
        type: 'capitalization',
        message: 'Croatian titles typically use sentence case, not title case',
        severity: 'low',
      });
    }

    // Check for appropriate Croatian terminology
    if (this.shouldUseNativeCroatianTerms(english, croatian)) {
      issues.push({
        type: 'terminology',
        message:
          'Consider using native Croatian terminology instead of loanwords',
        severity: 'medium',
      });
    }

    // Check for consonant cluster handling
    if (this.hasProblematicConsonantClusters(croatian)) {
      issues.push({
        type: 'consonant_clusters',
        message:
          'Check Croatian consonant cluster pronunciation and readability',
        severity: 'low',
      });
    }

    return issues;
  }

  // Croatian-specific helper methods
  hasAppropriateCroatianVerb(english, croatian) {
    // Check for Croatian imperative forms (preferred on buttons) or infinitives
    const croatianVerbPatterns = [
      /aj$/,
      /i$/,
      /ite$/,
      /ajte$/, // imperative forms
      /ti$/,
      /ći$/, // infinitive endings
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
      // Croatian button labels lead with the verb ("Dodaj komentar"), so the
      // form to check is the first word, not the end of the whole label.
      const verb = croatian.toLowerCase().split(/\s+/)[0];
      return croatianVerbPatterns.some((pattern) => pattern.test(verb));
    }

    return true; // Default to OK if not an action word
  }

  hasInconsistentCroatianCase(croatian) {
    // Basic check for potential case inconsistencies
    // Check for inappropriate mixing of different case patterns
    return croatian.includes('_') || croatian.match(/[A-ZČĆĐŠŽ]{3,}/);
  }

  hasGenderAgreementIssues(croatian) {
    // Check for potential gender agreement issues across the three genders
    const mismatchPatterns = [
      /i\s+\w+a\b/i, // masculine adjective with feminine noun
      /a\s+\w+i\b/i, // feminine adjective with masculine noun
      /o\s+\w+a\b/i, // neuter adjective with feminine noun
    ];

    return mismatchPatterns.some((pattern) => pattern.test(croatian));
  }

  missingCroatianDiacritic(english, croatian) {
    // Check if Croatian text might be missing diacritic marks
    const suspiciousPatterns = [
      /ch(?![aeiou])/, // 'ch' should probably be 'č'
      /sh(?![aeiou])/, // 'sh' should probably be 'š'
      /zh(?![aeiou])/, // 'zh' should probably be 'ž'
      /dj/, // 'dj' should probably be 'đ'
    ];

    return suspiciousPatterns.some((pattern) =>
      pattern.test(croatian.toLowerCase()),
    );
  }

  hasProperCroatianNumberAgreement(croatian, varName) {
    // Check for Croatian number agreement including special rules for 2-4
    const numberVar = `{${varName}}`;
    if (croatian.includes(numberVar)) {
      // Croatian has special forms for 2-4 (paucal) vs 5+ (genitive plural)
      return !croatian.match(new RegExp(`${numberVar}\\s+\\w+[^yaiů]$`));
    }
    return true;
  }

  needsCroatianCaseAdjustment(croatian, varName) {
    const variablePattern = `{${varName}}`;
    // Check if variable appears in context that requires specific case
    const caseRequiringContexts = [
      /\s(s|sa|bez|do|od|na|u|za|po|prije|preko|prema)\s/, // prepositions requiring specific cases
      /\s(oko|osim|tijekom|zbog|radi|pomoću)\s/, // more prepositions
    ];

    return (
      croatian.includes(variablePattern) &&
      caseRequiringContexts.some((pattern) => pattern.test(croatian))
    );
  }

  needsCroatianGenderAgreement(croatian, varName) {
    const variablePattern = `{${varName}}`;
    // Check if variable appears with adjectives that need gender agreement
    return (
      croatian.includes(variablePattern) &&
      croatian.match(/\s(novi|stari|dobri|loši|veliki|mali)\s/)
    );
  }

  hasInappropriateCroatianCapitalization(croatian) {
    // Check for English-style title case in Croatian
    const words = croatian.split(' ');
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

  shouldUseNativeCroatianTerms(english, croatian) {
    // Check for excessive use of loanwords where native terms exist
    const loanwords = [
      'kompjuter',
      'kompjutor',
      'imejl',
      'fajl',
      'daunloudati',
    ];

    return loanwords.some((loanword) =>
      croatian.toLowerCase().includes(loanword),
    );
  }

  hasProblematicConsonantClusters(croatian) {
    // Check for potentially problematic consonant clusters
    const difficultClusters = [
      /[bcdfghjklmnpqrstvwxz]{4,}/, // 4+ consonants in a row
      /[šž][bcdfg]/, // specific difficult combinations
    ];

    return difficultClusters.some((pattern) =>
      pattern.test(croatian.toLowerCase()),
    );
  }

  // Generate improvement recommendations
  generateRecommendations() {
    return [
      '• Use Croatian sentence case for titles instead of English title case',
      '• Prefer native Croatian terms over loanwords when available',
      '• Use imperative forms (-aj/-i/-ite) for action buttons',
      '• Pay attention to Croatian case agreement with variables (7 cases)',
      '• Include polite language markers in error messages (molimo, žao nam je)',
      '• Ensure proper gender agreement (masculine, feminine, neuter)',
      '• Use proper Croatian diacritics (č, ć, dž, đ, š, ž)',
      '• Check number agreement including special forms for 2-4 vs 5+',
      '• Use the formal "vi" form in professional contexts',
      '• Consider verb aspect usage (perfective/imperfective) for proper meaning',
      '• Watch consonant cluster readability and pronunciation',
    ];
  }

  // Main analysis function
  analyze() {
    console.log('🔍 Starting Croatian translation analysis...\n');

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

    console.log('\n📊 CROATIAN TRANSLATION ANALYSIS REPORT');
    console.log('==================================================');
    console.log(`Total improvement opportunities found: ${totalIssues}\n`);

    // Button issues
    if (buttonIssues.length > 0) {
      console.log(`🔘 BUTTON TRANSLATION ISSUES (${buttonIssues.length})`);
      console.log('------------------------------');
      buttonIssues.slice(0, 5).forEach((item, index) => {
        console.log(`${index + 1}. "${item.english}" → "${item.croatian}"`);
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
        console.log(`${index + 1}. "${item.english}" → "${item.croatian}"`);
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
        console.log(`${index + 1}. "${item.english}" → "${item.croatian}"`);
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
      '2. Review button text for Croatian infinitive or imperative forms',
    );
    console.log('3. Ensure proper diacritic usage for Croatian characters');
    console.log('4. Check number agreement including 2-4 paucal forms');
    console.log('6. Standardize title capitalization to Croatian conventions');
  }
}

// Run the analysis
if (require.main === module) {
  const analyzer = new CroatianTranslationAnalyzer();
  analyzer.analyze();
}

module.exports = CroatianTranslationAnalyzer;
