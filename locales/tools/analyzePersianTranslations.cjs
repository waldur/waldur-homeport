'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Persian/Farsi Translation Quality Analysis
 *
 * Analyzes Persian translations against enhanced context to identify improvement opportunities
 * Focuses on Persian language-specific grammar, style, and cultural adaptation
 */

class PersianTranslationAnalyzer {
  constructor() {
    this.enhancedTemplate = {};
    this.persianTranslations = {};
    this.issues = [];
    this.recommendations = [];
  }

  // Load enhanced template and Persian translations
  loadData() {
    try {
      const rootDir = path.join(__dirname, '../../');
      const enhancedContent = fs.readFileSync(
        path.join(rootDir, 'template.json'),
        'utf8',
      );
      this.enhancedTemplate = JSON.parse(enhancedContent);

      const persianContent = fs.readFileSync(
        path.join(rootDir, 'locales/fa.json'),
        'utf8',
      );
      this.persianTranslations = JSON.parse(persianContent);

      console.log(
        `📚 Loaded ${Object.keys(this.enhancedTemplate).length} enhanced template entries`,
      );
      console.log(
        `🇮🇷 Loaded ${Object.keys(this.persianTranslations).length} Persian translations`,
      );
    } catch (error) {
      console.error(`Error loading data: ${error.message}`);
      process.exit(1);
    }
  }

  // Check if Persian translation follows button text conventions
  analyzeButtonTranslations() {
    const buttonIssues = [];

    for (const [english, templateData] of Object.entries(
      this.enhancedTemplate,
    )) {
      const persian = this.persianTranslations[english];
      if (!persian) continue;

      const context = templateData.context;
      if (
        context &&
        context.primary_ui_type &&
        context.primary_ui_type.includes('button')
      ) {
        const issues = this.checkButtonTextQuality(english, persian, context);
        if (issues.length > 0) {
          buttonIssues.push({
            english,
            persian,
            context: context.primary_ui_type,
            issues,
            locations: templateData.description,
          });
        }
      }
    }

    return buttonIssues;
  }

  // Check button text quality for Persian
  checkButtonTextQuality(english, persian, context) {
    const issues = [];

    // Check right-to-left text direction considerations
    if (this.hasRTLDirectionIssues(persian)) {
      issues.push({
        type: 'rtl_direction',
        message: 'Check right-to-left text direction considerations',
        severity: 'medium',
      });
    }

    // Check length - Persian can be longer than English
    if (persian.length > english.length * 2.5) {
      issues.push({
        type: 'length_concern',
        message: `Persian text significantly longer than English (${persian.length} vs ${english.length} chars)`,
        severity: 'medium',
      });
    }

    // Check for appropriate verb forms in action buttons
    if (
      context.primary_ui_type === 'submit_button' ||
      context.primary_ui_type === 'action_button'
    ) {
      if (!this.hasAppropriatePersianVerb(english, persian)) {
        issues.push({
          type: 'verb_form',
          message:
            'Consider using appropriate Persian verb form for action buttons',
          severity: 'low',
        });
      }
    }

    // Check for formal/informal address (شما/تو)
    if (this.hasInconsistentPersianAddress(persian)) {
      issues.push({
        type: 'address_consistency',
        message: 'Check formal/informal address consistency (شما/تو)',
        severity: 'high',
      });
    }

    // Check for ezafe construction
    if (this.hasIncorrectEzafeConstruction(persian)) {
      issues.push({
        type: 'ezafe_construction',
        message: 'Check Persian ezafe construction (ـِ linkage)',
        severity: 'medium',
      });
    }

    // Check for Persian vs Arabic vocabulary choices
    if (this.shouldPreferPersianOverArabic(english, persian)) {
      issues.push({
        type: 'persian_vs_arabic',
        message:
          'Consider using Persian vocabulary instead of Arabic loanwords',
        severity: 'low',
      });
    }

    // Check for formal register markers
    if (this.needsFormalRegisterMarkers(english, persian)) {
      issues.push({
        type: 'formal_register',
        message:
          'Consider using formal Persian register markers for professional context',
        severity: 'medium',
      });
    }

    return issues;
  }

  // Check variable handling in Persian translations
  analyzeVariableHandling() {
    const variableIssues = [];

    for (const [english, templateData] of Object.entries(
      this.enhancedTemplate,
    )) {
      const persian = this.persianTranslations[english];
      if (!persian) continue;

      const context = templateData.context;
      if (context && context.variables) {
        const issues = this.checkPersianVariableHandling(
          english,
          persian,
          context.variables,
        );
        if (issues.length > 0) {
          variableIssues.push({
            english,
            persian,
            variables: context.variables,
            issues,
            locations: templateData.description,
          });
        }
      }
    }

    return variableIssues;
  }

  // Check Persian variable handling (word order, ezafe, etc.)
  checkPersianVariableHandling(english, persian, variables) {
    const issues = [];

    // Check for word order with variables (SOV in Persian)
    for (const [varName, _varInfo] of Object.entries(variables)) {
      // Check for ezafe connection with variables
      if (this.needsEzafeWithVariable(persian, varName)) {
        issues.push({
          type: 'ezafe_variable',
          variable: varName,
          message: 'Variable may need ezafe connection in Persian context',
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
      const persian = this.persianTranslations[english];
      if (!persian) continue;

      const context = templateData.context;
      if (context && context.primary_ui_type === 'title') {
        const issues = this.checkPersianTitle(english, persian);
        if (issues.length > 0) {
          titleIssues.push({
            english,
            persian,
            issues,
            locations: templateData.description,
          });
        }
      }
    }

    return titleIssues;
  }

  // Check Persian title quality
  checkPersianTitle(english, persian) {
    const issues = [];

    // Check for appropriate Persian terminology
    if (this.shouldUseNativePersianTerms(english, persian)) {
      issues.push({
        type: 'terminology',
        message:
          'Consider using native Persian terminology instead of loanwords',
        severity: 'medium',
      });
    }

    // Check for formal language appropriate for titles
    if (this.needsFormalPersianLanguage(persian)) {
      issues.push({
        type: 'formality',
        message:
          'Consider using formal Persian language appropriate for titles',
        severity: 'low',
      });
    }

    return issues;
  }

  // Persian-specific helper methods
  hasRTLDirectionIssues(persian) {
    // Check for potential RTL direction issues (very basic)
    // Look for mixed LTR content that might affect layout
    const hasNumbers = /\d/.test(persian);
    const hasEnglishLetters = /[a-zA-Z]/.test(persian);

    return hasNumbers && hasEnglishLetters; // Mixed content might need RTL consideration
  }

  hasAppropriatePersianVerb(english, persian) {
    // Check for Persian action verb forms
    const persianActionVerbs =
      /(اضافه کنید|ذخیره کنید|حذف کنید|ایجاد کنید|به‌روزرسانی|ارسال|لغو)/;

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
      return persianActionVerbs.test(persian);
    }

    return true; // Default to OK if not an action word
  }

  hasInconsistentPersianAddress(persian) {
    // Check for mixing formal/informal address
    const formalMarkers = /(شما|شمایان|تان|تون)/;
    const informalMarkers = /(تو|ات|ت)/;

    return formalMarkers.test(persian) && informalMarkers.test(persian);
  }

  hasIncorrectEzafeConstruction(persian) {
    // Check for potential ezafe construction issues
    // Very simplified - real ezafe analysis would be extremely complex
    const ezafePattern = /ـِ/;
    const possibleEzafeContext = /\s[آاءةهی]\s/;

    // If there are contexts where ezafe might be needed but missing
    return possibleEzafeContext.test(persian) && !ezafePattern.test(persian);
  }

  shouldPreferPersianOverArabic(english, persian) {
    // Check for opportunities to use Persian instead of Arabic vocabulary
    const arabicLoanwords = /(کتاب|قلم|مکتب|ادب|فکر)/;

    return arabicLoanwords.test(persian); // Simplified check
  }

  needsFormalRegisterMarkers(english, persian) {
    // Check if Persian needs formal register markers
    const formalMarkers = /(لطفاً|خواهشمند|متشکرم|محترم)/;
    const contextNeedsFormal =
      english.includes('please') || english.includes('kindly');

    return contextNeedsFormal && !formalMarkers.test(persian);
  }

  needsEzafeWithVariable(persian, varName) {
    const numberVar = `{${varName}}`;
    // Check if variable appears in context that might need ezafe
    if (persian.includes(numberVar)) {
      const varIndex = persian.indexOf(numberVar);
      const beforeVar = persian.substr(Math.max(0, varIndex - 10), 10);
      const afterVar = persian.substr(varIndex + numberVar.length, 10);

      // Very basic check for potential ezafe contexts
      return (
        /[آاهیة]$/.test(beforeVar.trim()) && /^[آاهیة]/.test(afterVar.trim())
      );
    }
    return false;
  }

  // Main analysis function
  analyze() {
    console.log('🔍 Starting Persian translation analysis...\n');

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

    console.log('\n📊 PERSIAN TRANSLATION ANALYSIS REPORT');
    console.log('==================================================');
    console.log(`Total improvement opportunities found: ${totalIssues}\n`);

    // Button issues
    if (buttonIssues.length > 0) {
      console.log(`🔘 BUTTON TRANSLATION ISSUES (${buttonIssues.length})`);
      console.log('------------------------------');
      buttonIssues.slice(0, 5).forEach((item, index) => {
        console.log(`${index + 1}. "${item.english}" → "${item.persian}"`);
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
        console.log(`${index + 1}. "${item.english}" → "${item.persian}"`);
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
        console.log(`${index + 1}. "${item.english}" → "${item.persian}"`);
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
    console.log('1. Focus on right-to-left text direction considerations');
    console.log('2. Review formal/informal address consistency (شما vs تو)');
    console.log('3. Check ezafe construction for proper noun connections');
    console.log('5. Consider Persian SOV word order with variable placement');
  }
}

// Run the analysis
if (require.main === module) {
  const analyzer = new PersianTranslationAnalyzer();
  analyzer.analyze();
}

module.exports = PersianTranslationAnalyzer;
