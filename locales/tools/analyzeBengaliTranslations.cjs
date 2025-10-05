'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Bengali Translation Quality Analysis
 * 
 * Analyzes Bengali translations against enhanced context to identify improvement opportunities
 * Focuses on Bengali language-specific grammar, style, and cultural adaptation
 */

class BengaliTranslationAnalyzer {
  constructor() {
    this.enhancedTemplate = {};
    this.bengaliTranslations = {};
    this.issues = [];
    this.recommendations = [];
  }

  // Load enhanced template and Bengali translations
  loadData() {
    try {
      const rootDir = path.join(__dirname, '../../');
      const enhancedContent = fs.readFileSync(path.join(rootDir, 'template.json'), 'utf8');
      this.enhancedTemplate = JSON.parse(enhancedContent);
      
      const bengaliContent = fs.readFileSync(path.join(rootDir, 'locales/bn.json'), 'utf8');
      this.bengaliTranslations = JSON.parse(bengaliContent);
      
      console.log(`📚 Loaded ${Object.keys(this.enhancedTemplate).length} enhanced template entries`);
      console.log(`🇧🇩 Loaded ${Object.keys(this.bengaliTranslations).length} Bengali translations`);
    } catch (error) {
      console.error(`Error loading data: ${error.message}`);
      process.exit(1);
    }
  }

  // Check if Bengali translation follows button text conventions
  analyzeButtonTranslations() {
    const buttonIssues = [];
    
    for (const [english, templateData] of Object.entries(this.enhancedTemplate)) {
      const bengali = this.bengaliTranslations[english];
      if (!bengali) continue;
      
      const context = templateData.context;
      if (context && context.primary_ui_type && context.primary_ui_type.includes('button')) {
        const issues = this.checkButtonTextQuality(english, bengali, context);
        if (issues.length > 0) {
          buttonIssues.push({
            english,
            bengali,
            context: context.primary_ui_type,
            issues,
            locations: templateData.description
          });
        }
      }
    }
    
    return buttonIssues;
  }

  // Check button text quality for Bengali
  checkButtonTextQuality(english, bengali, context) {
    const issues = [];
    
    // Check length - Bengali can be significantly longer than English
    if (bengali.length > english.length * 3) {
      issues.push({
        type: 'length_concern',
        message: `Bengali text significantly longer than English (${bengali.length} vs ${english.length} chars)`,
        severity: 'medium'
      });
    }
    
    // Check for appropriate verb forms in action buttons
    if (context.primary_ui_type === 'submit_button' || context.primary_ui_type === 'action_button') {
      if (!this.hasAppropriateBengaliVerb(english, bengali)) {
        issues.push({
          type: 'verb_form',
          message: 'Consider using appropriate Bengali verb form for action buttons',
          severity: 'low'
        });
      }
    }
    
    // Check for formal/informal/intimate address (আপনি/তুমি/তুই)
    if (this.hasInconsistentBengaliAddress(bengali)) {
      issues.push({
        type: 'address_consistency',
        message: 'Check formal/informal/intimate address consistency (আপনি/তুমি/তুই)',
        severity: 'high'
      });
    }
    
    // Check for gender markers in verbs
    if (this.needsGenderMarkerConsideration(bengali)) {
      issues.push({
        type: 'gender_markers',
        message: 'Consider gender markers in Bengali verbs if context requires',
        severity: 'medium'
      });
    }
    
    // Check for classifier usage with numbers
    if (this.hasIncorrectBengaliClassifier(bengali)) {
      issues.push({
        type: 'classifier_usage',
        message: 'Check Bengali classifier usage with numbers',
        severity: 'medium'
      });
    }
    
    // Check for conjunct consonants
    if (this.hasConjunctConsonantIssues(bengali)) {
      issues.push({
        type: 'conjunct_consonants',
        message: 'Check proper formation of Bengali conjunct consonants',
        severity: 'low'
      });
    }
    
    // Check for honorific usage
    if (this.needsHonorificUsage(bengali)) {
      issues.push({
        type: 'honorific_usage',
        message: 'Consider appropriate Bengali honorific usage for respectful tone',
        severity: 'medium'
      });
    }
    
    return issues;
  }

  // Check variable handling in Bengali translations
  analyzeVariableHandling() {
    const variableIssues = [];
    
    for (const [english, templateData] of Object.entries(this.enhancedTemplate)) {
      const bengali = this.bengaliTranslations[english];
      if (!bengali) continue;
      
      const context = templateData.context;
      if (context && context.variables) {
        const issues = this.checkBengaliVariableHandling(english, bengali, context.variables);
        if (issues.length > 0) {
          variableIssues.push({
            english,
            bengali,
            variables: context.variables,
            issues,
            locations: templateData.description
          });
        }
      }
    }
    
    return variableIssues;
  }

  // Check Bengali variable handling (agreement, classifiers, etc.)
  checkBengaliVariableHandling(english, bengali, variables) {
    const issues = [];
    
    // Check for number-classifier agreement issues
    for (const [varName, varInfo] of Object.entries(variables)) {
      if (varInfo.type === 'number') {
        if (!this.hasProperBengaliNumberClassifier(bengali, varName)) {
          issues.push({
            type: 'number_classifier',
            variable: varName,
            message: 'Bengali numbers may need appropriate classifiers',
            severity: 'high'
          });
        }
      }
      
      // Check for proper verb agreement with variables
      if (this.needsBengaliVerbAgreement(bengali, varName)) {
        issues.push({
          type: 'verb_agreement',
          variable: varName,
          message: 'Variable may need Bengali verb agreement consideration',
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
      const bengali = this.bengaliTranslations[english];
      if (!bengali) continue;
      
      const context = templateData.context;
      if (context && context.primary_ui_type === 'title') {
        const issues = this.checkBengaliTitle(english, bengali);
        if (issues.length > 0) {
          titleIssues.push({
            english,
            bengali,
            issues,
            locations: templateData.description
          });
        }
      }
    }
    
    return titleIssues;
  }

  // Check Bengali title quality
  checkBengaliTitle(english, bengali) {
    const issues = [];
    
    // Check for appropriate Bengali terminology
    if (this.shouldUseNativeBengaliTerms(english, bengali)) {
      issues.push({
        type: 'terminology',
        message: 'Consider using native Bengali terminology instead of loanwords',
        severity: 'medium'
      });
    }
    
    // Check for formal language appropriate for titles
    if (this.needsFormalBengaliLanguage(bengali)) {
      issues.push({
        type: 'formality',
        message: 'Consider using formal Bengali language appropriate for titles',
        severity: 'low'
      });
    }
    
    return issues;
  }

  // Bengali-specific helper methods
  hasAppropriateBengaliVerb(english, bengali) {
    // Check for Bengali action verb forms
    const bengaliActionVerbs = /(যোগ করুন|সংরক্ষণ করুন|মুছে ফেলুন|তৈরি করুন|আপডেট করুন|পাঠান|বাতিল করুন)/;
    
    const actionWords = ['add', 'save', 'delete', 'create', 'update', 'send', 'cancel'];
    if (actionWords.some(word => english.toLowerCase().includes(word))) {
      return bengaliActionVerbs.test(bengali);
    }
    
    return true; // Default to OK if not an action word
  }

  hasInconsistentBengaliAddress(bengali) {
    // Check for mixing formal/informal/intimate address
    const formalMarkers = /(আপনি|আপনার|আপনাকে|আপনাদের)/;
    const informalMarkers = /(তুমি|তোমার|তোমাকে|তোমাদের)/;
    const intimateMarkers = /(তুই|তোর|তোকে)/;
    
    const addressTypes = [
      formalMarkers.test(bengali),
      informalMarkers.test(bengali),
      intimateMarkers.test(bengali)
    ].filter(Boolean).length;
    
    return addressTypes > 1; // More than one address type used
  }

  needsGenderMarkerConsideration(bengali) {
    // Check if Bengali might need gender marker consideration
    // This is simplified - Bengali gender marking is complex
    const verbForms = /(করেছেন|করেছে|করেছি|হয়েছেন|হয়েছে)/;
    
    return verbForms.test(bengali); // Might need gender consideration
  }

  hasIncorrectBengaliClassifier(bengali) {
    // Check for potential classifier issues with numbers
    const numberPattern = /\d+/;
    const classifierPattern = /(জন|টি|টা|খানা|খানি|গাছ|পাতা)/;
    
    if (numberPattern.test(bengali)) {
      // Very basic check - real implementation would need sophisticated parsing
      return !classifierPattern.test(bengali);
    }
    
    return false;
  }

  hasConjunctConsonantIssues(bengali) {
    // Check for potential conjunct consonant formation issues
    // This is very simplified - real conjunct analysis would be extremely complex
    const conjunctPatterns = /(ক্ষ|জ্ঞ|ত্র|ন্ত|স্ত|স্থ)/;
    
    // Basic check for common conjuncts
    return bengali.includes('্') && !conjunctPatterns.test(bengali);
  }

  needsHonorificUsage(bengali) {
    // Check if Bengali needs honorific usage
    const honorificMarkers = /(মহাশয়|মহাশয়া|সাহেব|জি|সম্মানিত)/;
    const contextNeedsHonorific = bengali.includes('আপনি'); // Formal address might need honorifics
    
    return contextNeedsHonorific && !honorificMarkers.test(bengali);
  }

  hasProperBengaliNumberClassifier(bengali, varName) {
    // Check for potential number-classifier issues
    const numberVar = `{${varName}}`;
    if (bengali.includes(numberVar)) {
      // Look for classifiers near the number variable
      const classifiers = /(জন|টি|টা|খানা|খানি|গাছ|পাতা|বার|দিন)/;
      const varIndex = bengali.indexOf(numberVar);
      const surroundingText = bengali.substr(Math.max(0, varIndex - 20), 40);
      
      return classifiers.test(surroundingText);
    }
    return true;
  }

  needsBengaliVerbAgreement(bengali, varName) {
    const numberVar = `{${varName}}`;
    // Check if variable appears in context that might need verb agreement
    return bengali.includes(numberVar) && 
           bengali.match(/(করেছেন|করেছে|হয়েছেন|হয়েছে|আছেন|আছে)/);
  }


  // Main analysis function
  analyze() {
    console.log('🔍 Starting Bengali translation analysis...\n');
    
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
    
    console.log('\n📊 BENGALI TRANSLATION ANALYSIS REPORT');
    console.log('==================================================');
    console.log(`Total improvement opportunities found: ${totalIssues}\n`);
    
    // Button issues
    if (buttonIssues.length > 0) {
      console.log(`🔘 BUTTON TRANSLATION ISSUES (${buttonIssues.length})`);
      console.log('------------------------------');
      buttonIssues.slice(0, 5).forEach((item, index) => {
        console.log(`${index + 1}. "${item.english}" → "${item.bengali}"`);
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
        console.log(`${index + 1}. "${item.english}" → "${item.bengali}"`);
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
        console.log(`${index + 1}. "${item.english}" → "${item.bengali}"`);
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
    console.log('2. Review classifier usage with numbers and variables');
    console.log('4. Check verb agreement and gender markers where relevant');
    console.log('5. Consider honorific usage for respectful professional tone');
  }
}

// Run the analysis
if (require.main === module) {
  const analyzer = new BengaliTranslationAnalyzer();
  analyzer.analyze();
}

module.exports = BengaliTranslationAnalyzer;