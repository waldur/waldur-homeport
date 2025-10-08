'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Thai Translation Quality Analysis
 *
 * Analyzes Thai translations against enhanced context to identify improvement opportunities
 * Focuses on Thai language-specific grammar, style, and cultural adaptation
 */

class ThaiTranslationAnalyzer {
  constructor() {
    this.enhancedTemplate = {};
    this.thaiTranslations = {};
    this.issues = [];
    this.recommendations = [];
  }

  // Load enhanced template and Thai translations
  loadData() {
    try {
      const rootDir = path.join(__dirname, '../../');
      const enhancedContent = fs.readFileSync(
        path.join(rootDir, 'template.json'),
        'utf8',
      );
      this.enhancedTemplate = JSON.parse(enhancedContent);

      const thaiContent = fs.readFileSync(
        path.join(rootDir, 'locales/th.json'),
        'utf8',
      );
      this.thaiTranslations = JSON.parse(thaiContent);

      console.log(
        `📚 Loaded ${Object.keys(this.enhancedTemplate).length} enhanced template entries`,
      );
      console.log(
        `🇹🇭 Loaded ${Object.keys(this.thaiTranslations).length} Thai translations`,
      );
    } catch (error) {
      console.error(`Error loading data: ${error.message}`);
      process.exit(1);
    }
  }

  // Check if Thai translation follows button text conventions
  analyzeButtonTranslations() {
    const buttonIssues = [];

    for (const [english, templateData] of Object.entries(
      this.enhancedTemplate,
    )) {
      const thai = this.thaiTranslations[english];
      if (!thai) continue;

      const context = templateData.context;
      if (
        context &&
        context.primary_ui_type &&
        context.primary_ui_type.includes('button')
      ) {
        const issues = this.checkButtonTextQuality(english, thai, context);
        if (issues.length > 0) {
          buttonIssues.push({
            english,
            thai,
            context: context.primary_ui_type,
            issues,
            locations: templateData.description,
          });
        }
      }
    }

    return buttonIssues;
  }

  // Check button text quality for Thai
  checkButtonTextQuality(english, thai, context) {
    const issues = [];

    // Check length - Thai can vary significantly in length
    if (thai.length > english.length * 4) {
      issues.push({
        type: 'length_concern',
        message: `Thai text significantly longer than English (${thai.length} vs ${english.length} chars)`,
        severity: 'medium',
      });
    }

    // Check for appropriate verb forms in action buttons
    if (
      context.primary_ui_type === 'submit_button' ||
      context.primary_ui_type === 'action_button'
    ) {
      if (!this.hasAppropriateThaiVerb(english, thai)) {
        issues.push({
          type: 'verb_form',
          message:
            'Consider using Thai imperative or polite request form for action buttons',
          severity: 'low',
        });
      }
    }

    // Check for word spacing (Thai doesn't use spaces between words)
    if (this.hasInappropriateThaiSpacing(thai)) {
      issues.push({
        type: 'word_spacing',
        message:
          "Check Thai word spacing - Thai typically doesn't use spaces between words",
        severity: 'low',
      });
    }

    // Check for formal register markers
    if (this.needsFormalRegisterMarkers(english, thai)) {
      issues.push({
        type: 'formal_register',
        message:
          'Consider using formal Thai register markers for professional context',
        severity: 'medium',
      });
    }

    // Check for classifier usage with numbers
    if (this.hasIncorrectClassifierUsage(thai)) {
      issues.push({
        type: 'classifier_usage',
        message: 'Check Thai classifier usage with numbers',
        severity: 'medium',
      });
    }

    return issues;
  }

  // Check variable handling in Thai translations
  analyzeVariableHandling() {
    const variableIssues = [];

    for (const [english, templateData] of Object.entries(
      this.enhancedTemplate,
    )) {
      const thai = this.thaiTranslations[english];
      if (!thai) continue;

      const context = templateData.context;
      if (context && context.variables) {
        const issues = this.checkThaiVariableHandling(
          english,
          thai,
          context.variables,
        );
        if (issues.length > 0) {
          variableIssues.push({
            english,
            thai,
            variables: context.variables,
            issues,
            locations: templateData.description,
          });
        }
      }
    }

    return variableIssues;
  }

  // Check Thai variable handling (classifiers, word order, etc.)
  checkThaiVariableHandling(english, thai, variables) {
    const issues = [];

    // Check for number-classifier agreement issues
    for (const [varName, varInfo] of Object.entries(variables)) {
      if (varInfo.type === 'number') {
        if (!this.hasProperThaiNumberClassifier(thai, varName)) {
          issues.push({
            type: 'number_classifier',
            variable: varName,
            message: 'Thai numbers may need appropriate classifiers',
            severity: 'high',
          });
        }
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
      const thai = this.thaiTranslations[english];
      if (!thai) continue;

      const context = templateData.context;
      if (context && context.primary_ui_type === 'title') {
        const issues = this.checkThaiTitle(english, thai);
        if (issues.length > 0) {
          titleIssues.push({
            english,
            thai,
            issues,
            locations: templateData.description,
          });
        }
      }
    }

    return titleIssues;
  }

  // Check Thai title quality
  checkThaiTitle(english, thai) {
    const issues = [];

    // Check for appropriate Thai terminology
    if (this.shouldUseNativeThaiTerms(english, thai)) {
      issues.push({
        type: 'terminology',
        message: 'Consider using native Thai terminology instead of loanwords',
        severity: 'medium',
      });
    }

    // Check for formal language appropriate for titles
    if (this.needsFormalThaiLanguage(thai)) {
      issues.push({
        type: 'formality',
        message: 'Consider using formal Thai language appropriate for titles',
        severity: 'low',
      });
    }

    return issues;
  }

  // Thai-specific helper methods
  hasAppropriateThaiVerb(english, thai) {
    // Check for Thai action verb forms
    const thaiActionVerbs = /^(เพิ่ม|บันทึก|ลบ|สร้าง|อัปเดต|ส่ง|ยกเลิก)/;

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
      return thaiActionVerbs.test(thai);
    }

    return true; // Default to OK if not an action word
  }

  hasInappropriateThaiSpacing(thai) {
    // Check for excessive spacing in Thai (very basic check)
    // Thai traditionally doesn't use spaces between words
    const wordCount = thai.split(/\s+/).length;
    const nonSpaceLength = thai.replace(/\s/g, '').length;

    // If there are many spaces relative to text length, it might be inappropriate
    return (
      wordCount > 3 && (thai.length - nonSpaceLength) / nonSpaceLength > 0.3
    );
  }

  needsFormalRegisterMarkers(english, thai) {
    // Check if Thai needs formal register markers
    const formalMarkers = /(กรุณา|โปรด|ขอให้|พึง)/;
    const contextNeedsFormal =
      english.includes('please') || english.includes('kindly');

    return contextNeedsFormal && !formalMarkers.test(thai);
  }

  hasIncorrectClassifierUsage(thai) {
    // Check for potential classifier issues with numbers
    const numberPattern = /\d+/;
    const classifierPattern = /(คน|ตัว|อัน|เล่ม|ใบ|ลูก|เครื่อง)/;

    if (numberPattern.test(thai)) {
      // Very basic check - real implementation would need sophisticated parsing
      return !classifierPattern.test(thai);
    }

    return false;
  }

  hasProperThaiNumberClassifier(thai, varName) {
    // Check for potential number-classifier issues
    const numberVar = `{${varName}}`;
    if (thai.includes(numberVar)) {
      // Look for classifiers near the number variable
      const classifiers = /(คน|ตัว|อัน|เล่ม|ใบ|ลูก|เครื่อง|ชิ้น|แห่ง)/;
      const varIndex = thai.indexOf(numberVar);
      const surroundingText = thai.substr(Math.max(0, varIndex - 20), 40);

      return classifiers.test(surroundingText);
    }
    return true;
  }

  // Main analysis function
  analyze() {
    console.log('🔍 Starting Thai translation analysis...\n');

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

    console.log('\n📊 THAI TRANSLATION ANALYSIS REPORT');
    console.log('==================================================');
    console.log(`Total improvement opportunities found: ${totalIssues}\n`);

    // Button issues
    if (buttonIssues.length > 0) {
      console.log(`🔘 BUTTON TRANSLATION ISSUES (${buttonIssues.length})`);
      console.log('------------------------------');
      buttonIssues.slice(0, 5).forEach((item, index) => {
        console.log(`${index + 1}. "${item.english}" → "${item.thai}"`);
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
        console.log(`${index + 1}. "${item.english}" → "${item.thai}"`);
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
        console.log(`${index + 1}. "${item.english}" → "${item.thai}"`);
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
    console.log('2. Review classifier usage with numbers and variables');
    console.log('4. Check word spacing conventions for Thai text');
    console.log(
      '5. Consider native Thai terms over loanwords where appropriate',
    );
  }
}

// Run the analysis
if (require.main === module) {
  const analyzer = new ThaiTranslationAnalyzer();
  analyzer.analyze();
}

module.exports = ThaiTranslationAnalyzer;
