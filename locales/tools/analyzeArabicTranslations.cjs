'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Arabic Translation Quality Analysis
 * 
 * Analyzes Arabic translations against enhanced context to identify improvement opportunities
 * Focuses on Arabic language-specific grammar, style, and cultural adaptation
 */

class ArabicTranslationAnalyzer {
  constructor() {
    this.enhancedTemplate = {};
    this.arabicTranslations = {};
    this.issues = [];
    this.recommendations = [];
  }

  // Load enhanced template and Arabic translations
  loadData() {
    try {
      const rootDir = path.join(__dirname, '../../');
      const enhancedContent = fs.readFileSync(path.join(rootDir, 'template.json'), 'utf8');
      this.enhancedTemplate = JSON.parse(enhancedContent);
      
      const arabicContent = fs.readFileSync(path.join(rootDir, 'locales/ar.json'), 'utf8');
      this.arabicTranslations = JSON.parse(arabicContent);
      
      console.log(`📚 Loaded ${Object.keys(this.enhancedTemplate).length} enhanced template entries`);
      console.log(`🇸🇦 Loaded ${Object.keys(this.arabicTranslations).length} Arabic translations`);
    } catch (error) {
      console.error(`Error loading data: ${error.message}`);
      process.exit(1);
    }
  }

  // Check if Arabic translation follows button text conventions
  analyzeButtonTranslations() {
    const buttonIssues = [];
    
    for (const [english, templateData] of Object.entries(this.enhancedTemplate)) {
      const arabic = this.arabicTranslations[english];
      if (!arabic) continue;
      
      const context = templateData.context;
      if (context && context.primary_ui_type && context.primary_ui_type.includes('button')) {
        const issues = this.checkButtonTextQuality(english, arabic, context);
        if (issues.length > 0) {
          buttonIssues.push({
            english,
            arabic,
            context: context.primary_ui_type,
            issues,
            locations: templateData.description
          });
        }
      }
    }
    
    return buttonIssues;
  }

  // Check button text quality for Arabic
  checkButtonTextQuality(english, arabic, context) {
    const issues = [];
    
    // Check length - Arabic can be significantly different from English
    if (arabic.length > english.length * 4.0) {
      issues.push({
        type: 'length_concern',
        message: `Arabic text significantly longer than English (${arabic.length} vs ${english.length} chars)`,
        severity: 'medium'
      });
    }
    
    // Check for right-to-left text direction handling
    if (!this.hasProperRTLHandling(arabic)) {
      issues.push({
        type: 'rtl_direction',
        message: 'Ensure proper right-to-left text direction handling for Arabic',
        severity: 'high'
      });
    }
    
    // Check for appropriate verb forms in action buttons (Arabic imperative)
    if (context.primary_ui_type === 'submit_button' || context.primary_ui_type === 'action_button') {
      if (!this.hasAppropriateArabicVerb(english, arabic)) {
        issues.push({
          type: 'verb_form',
          message: 'Consider using Arabic imperative or command form for action buttons',
          severity: 'low'
        });
      }
    }
    
    
    return issues;
  }

  // Check variable handling in Arabic translations
  analyzeVariableHandling() {
    const variableIssues = [];
    
    for (const [english, templateData] of Object.entries(this.enhancedTemplate)) {
      const arabic = this.arabicTranslations[english];
      if (!arabic) continue;
      
      const context = templateData.context;
      if (context && context.variables) {
        const issues = this.checkArabicVariableHandling(english, arabic, context.variables);
        if (issues.length > 0) {
          variableIssues.push({
            english,
            arabic,
            variables: context.variables,
            issues,
            locations: templateData.description
          });
        }
      }
    }
    
    return variableIssues;
  }

  // Check Arabic variable handling (number agreement, gender, dual forms, etc.)
  checkArabicVariableHandling(english, arabic, variables) {
    const issues = [];
    
    // Check for number-noun agreement issues (including dual forms)
    for (const [varName, varInfo] of Object.entries(variables)) {
      if (varInfo.type === 'number') {
        if (!this.hasProperArabicNumberAgreement(arabic, varName)) {
          issues.push({
            type: 'number_agreement',
            variable: varName,
            message: 'Arabic number-noun agreement may need attention (1, 2, 3-10, 11+ forms)',
            severity: 'high'
          });
        }
      }
      
      // Check for gender agreement with variables
      if (this.needsArabicGenderAgreement(arabic, varName)) {
        issues.push({
          type: 'gender_agreement',
          variable: varName,
          message: 'Variable may need gender agreement in Arabic context',
          severity: 'medium'
        });
      }
      
      // Check for dual form usage
      if (this.needsArabicDualForm(arabic, varName)) {
        issues.push({
          type: 'dual_form',
          variable: varName,
          message: 'Consider Arabic dual form for quantity of 2',
          severity: 'medium'
        });
      }
    }
    
    return issues;
  }

  // Analyze titles and headings
  analyzeTitleTranslations() {
    const titleIssues = [];
    
    for (const [english, templateData] of Object.entries(this.enhancedTemplate)) {
      const arabic = this.arabicTranslations[english];
      if (!arabic) continue;
      
      const context = templateData.context;
      if (context && context.primary_ui_type === 'title') {
        const issues = this.checkArabicTitle(english, arabic);
        if (issues.length > 0) {
          titleIssues.push({
            english,
            arabic,
            issues,
            locations: templateData.description
          });
        }
      }
    }
    
    return titleIssues;
  }

  // Check Arabic title quality
  checkArabicTitle(english, arabic) {
    const issues = [];
    
    // Check for appropriate Arabic terminology
    if (this.shouldUseNativeArabicTerms(english, arabic)) {
      issues.push({
        type: 'terminology',
        message: 'Consider using native Arabic terminology instead of transliterated loanwords',
        severity: 'medium'
      });
    }
    
    
    return issues;
  }

  // Arabic-specific helper methods
  hasProperRTLHandling(arabic) {
    // Check for potential RTL issues (simplified check)
    // Look for Latin characters mixed inappropriately with Arabic
    const mixedScript = /[a-zA-Z][ء-ي]|[ء-ي][a-zA-Z]/;
    return !mixedScript.test(arabic);
  }

  hasAppropriateArabicVerb(english, arabic) {
    // Check for Arabic imperative or command forms
    const arabicImperativePatterns = [
      /^[ء-ي]+$/,           // Arabic script only
      /[فعلتسن]/,           // Common imperative patterns
    ];
    
    const actionWords = ['add', 'save', 'delete', 'create', 'update', 'send', 'cancel'];
    if (actionWords.some(word => english.toLowerCase().includes(word))) {
      return arabicImperativePatterns.some(pattern => pattern.test(arabic));
    }
    
    return true; // Default to OK if not an action word
  }


  hasProperArabicNumberAgreement(arabic, varName) {
    // Check for Arabic number agreement (complex rules)
    const numberVar = `{${varName}}`;
    if (arabic.includes(numberVar)) {
      // Arabic has complex number agreement rules:
      // 1: singular
      // 2: dual
      // 3-10: plural with special agreement
      // 11+: different patterns
      return true; // Simplified - would need detailed morphological analysis
    }
    return true;
  }

  needsArabicGenderAgreement(arabic, varName) {
    const variablePattern = `{${varName}}`;
    // Check if variable appears with elements requiring gender agreement
    return arabic.includes(variablePattern) && 
           /[ء-ي]/.test(arabic); // Any Arabic text - simplified check
  }

  needsArabicDualForm(arabic, varName) {
    const variablePattern = `{${varName}}`;
    // Check if variable might represent a quantity of 2 (dual form needed)
    return arabic.includes(variablePattern) && 
           arabic.includes('2'); // Simplified check
  }

  isArabicErrorTooAbrupt(arabic) {
    // Check if error message is too abrupt
    const abruptPatterns = ['خطأ', 'مستحيل', 'ممنوع', 'غير صحيح'];
    // Check for polite language markers in Arabic
    return abruptPatterns.some(pattern => {
      return arabic.startsWith(pattern) && !arabic.includes('من فضلك');
    });
  }


  shouldUseNativeArabicTerms(english, arabic) {
    // Check for transliterated terms that could use native Arabic alternatives
    const transliteratedTerms = ['كمبيوتر', 'انترنت', 'ايميل', 'فايل'];
    
    return transliteratedTerms.some(term => arabic.includes(term));
  }


  // Generate improvement recommendations
  generateRecommendations() {
    return [
      '• Ensure proper right-to-left (RTL) text direction handling',
      '• Use appropriate Arabic imperative forms for action buttons',
      '• Pay attention to Arabic gender agreement (masculine/feminine)',
      '• Implement correct number-noun agreement (1, 2, 3-10, 11+ rules)',
      '• Use Arabic dual forms for quantities of 2',
      '• Include polite language markers (من فضلك، نرجو، يرجى)',
      '• Check definite article (ال) usage and sun/moon letter assimilation',
      '• Prefer native Arabic terms over transliterated loanwords',
      '• Use appropriate formal register for professional contexts',
      '• Consider Arabic construct state (إضافة) for compound terms',
      '• Ensure proper diacritical marks (harakat) when needed for clarity',
      '• Handle mixed Arabic-Latin text appropriately in RTL context'
    ];
  }

  // Main analysis function
  analyze() {
    console.log('🔍 Starting Arabic translation analysis...\n');
    
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
    const totalIssues = buttonIssues.length + variableIssues.length + titleIssues.length;
    
    console.log('\n📊 ARABIC TRANSLATION ANALYSIS REPORT');
    console.log('==================================================');
    console.log(`Total improvement opportunities found: ${totalIssues}\n`);
    
    // Button issues
    if (buttonIssues.length > 0) {
      console.log(`🔘 BUTTON TRANSLATION ISSUES (${buttonIssues.length})`);
      console.log('------------------------------');
      buttonIssues.slice(0, 5).forEach((item, index) => {
        console.log(`${index + 1}. "${item.english}" → "${item.arabic}"`);
        console.log(`   Context: ${item.context}`);
        item.issues.forEach(issue => {
          console.log(`   ⚠️  ${issue.message}`);
        });
        console.log('');
      });
      if (buttonIssues.length > 5) {
        console.log(`   ... and ${buttonIssues.length - 5} more button issues\n`);
      }
    }

    // Variable issues
    if (variableIssues.length > 0) {
      console.log(`🔢 VARIABLE HANDLING ISSUES (${variableIssues.length})`);
      console.log('------------------------------');
      variableIssues.slice(0, 5).forEach((item, index) => {
        console.log(`${index + 1}. "${item.english}" → "${item.arabic}"`);
        console.log(`   Variables: ${Object.keys(item.variables).join(', ')}`);
        item.issues.forEach(issue => {
          console.log(`   ⚠️  ${issue.message}`);
        });
        console.log('');
      });
      if (variableIssues.length > 5) {
        console.log(`   ... and ${variableIssues.length - 5} more variable issues\n`);
      }
    }

    // Title issues
    if (titleIssues.length > 0) {
      console.log(`📝 TITLE TRANSLATION ISSUES (${titleIssues.length})`);
      console.log('------------------------------');
      titleIssues.slice(0, 5).forEach((item, index) => {
        console.log(`${index + 1}. "${item.english}" → "${item.arabic}"`);
        console.log(`   Context: title`);
        item.issues.forEach(issue => {
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
    this.generateRecommendations().forEach(rec => console.log(rec));
    
    console.log('\n🎯 PRIORITY ACTIONS:');
    console.log('1. Focus on right-to-left (RTL) text direction handling first');
    console.log('2. Review complex Arabic number-noun agreement rules');
    console.log('3. Ensure proper gender agreement in verbs and adjectives');
    console.log('4. Check definite article usage and assimilation rules');
    console.log('5. Implement Arabic dual forms for quantities of 2');
  }
}

// Run the analysis
if (require.main === module) {
  const analyzer = new ArabicTranslationAnalyzer();
  analyzer.analyze();
}

module.exports = ArabicTranslationAnalyzer;