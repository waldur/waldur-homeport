'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Azerbaijani Translation Quality Analysis
 * 
 * Analyzes Azerbaijani translations against enhanced context to identify improvement opportunities
 * Focuses on Azerbaijani language-specific grammar, style, and cultural adaptation
 */

class AzerbaijaniTranslationAnalyzer {
  constructor() {
    this.enhancedTemplate = {};
    this.azerbaijaniTranslations = {};
    this.issues = [];
    this.recommendations = [];
  }

  // Load enhanced template and Azerbaijani translations
  loadData() {
    try {
      const rootDir = path.join(__dirname, '../../');
      const enhancedContent = fs.readFileSync(path.join(rootDir, 'template.json'), 'utf8');
      this.enhancedTemplate = JSON.parse(enhancedContent);
      
      const azerbaijaniContent = fs.readFileSync(path.join(rootDir, 'locales/az.json'), 'utf8');
      this.azerbaijaniTranslations = JSON.parse(azerbaijaniContent);
      
      console.log(`📚 Loaded ${Object.keys(this.enhancedTemplate).length} enhanced template entries`);
      console.log(`🇦🇿 Loaded ${Object.keys(this.azerbaijaniTranslations).length} Azerbaijani translations`);
    } catch (error) {
      console.error(`Error loading data: ${error.message}`);
      process.exit(1);
    }
  }

  // Check if Azerbaijani translation follows button text conventions
  analyzeButtonTranslations() {
    const buttonIssues = [];
    
    for (const [english, templateData] of Object.entries(this.enhancedTemplate)) {
      const azerbaijani = this.azerbaijaniTranslations[english];
      if (!azerbaijani) continue;
      
      const context = templateData.context;
      if (context && context.primary_ui_type && context.primary_ui_type.includes('button')) {
        const issues = this.checkButtonTextQuality(english, azerbaijani, context);
        if (issues.length > 0) {
          buttonIssues.push({
            english,
            azerbaijani,
            context: context.primary_ui_type,
            issues,
            locations: templateData.description
          });
        }
      }
    }
    
    return buttonIssues;
  }

  // Check button text quality for Azerbaijani
  checkButtonTextQuality(english, azerbaijani, context) {
    const issues = [];
    
    // Check length - Azerbaijani can be longer than English
    if (azerbaijani.length > english.length * 2.5) {
      issues.push({
        type: 'length_concern',
        message: `Azerbaijani text significantly longer than English (${azerbaijani.length} vs ${english.length} chars)`,
        severity: 'medium'
      });
    }
    
    // Check for appropriate verb forms in action buttons (Azerbaijani imperative)
    if (context.primary_ui_type === 'submit_button' || context.primary_ui_type === 'action_button') {
      if (!this.hasAppropriateAzerbaijaniVerb(english, azerbaijani)) {
        issues.push({
          type: 'verb_form',
          message: 'Consider using Azerbaijani imperative verb form for action buttons',
          severity: 'low'
        });
      }
    }
    
    // Check for case usage (Azerbaijani has 6 cases)
    if (this.hasIncorrectAzerbaijaniCase(azerbaijani)) {
      issues.push({
        type: 'case_usage',
        message: 'Check Azerbaijani case usage (6 cases available)',
        severity: 'medium'
      });
    }
    
    // Check for vowel harmony (front/back)
    if (this.violatesAzerbaijaniVowelHarmony(azerbaijani)) {
      issues.push({
        type: 'vowel_harmony',
        message: 'Check Azerbaijani vowel harmony (front/back vowel consistency)',
        severity: 'high'
      });
    }
    
    // Check for Turkish loanword vs native word usage
    if (this.shouldPreferNativeAzerbaijaniTerms(english, azerbaijani)) {
      issues.push({
        type: 'native_vs_loanword',
        message: 'Consider using native Azerbaijani terms instead of Turkish loanwords',
        severity: 'low'
      });
    }
    
    // Check for Latin script diacriticals (ə, ö, ü, ğ, ı, ş, ç)
    if (this.hasMissingDiacriticals(azerbaijani)) {
      issues.push({
        type: 'diacriticals',
        message: 'Check proper use of Azerbaijani diacriticals (ə, ö, ü, ğ, ı, ş, ç)',
        severity: 'medium'
      });
    }
    
    // Check for formal/informal address consistency (siz/sən)
    if (this.hasInconsistentAzerbaijaniAddress(azerbaijani)) {
      issues.push({
        type: 'address_consistency',
        message: 'Check formal/informal address consistency (siz/sən)',
        severity: 'medium'
      });
    }
    
    return issues;
  }

  // Check variable handling in Azerbaijani translations
  analyzeVariableHandling() {
    const variableIssues = [];
    
    for (const [english, templateData] of Object.entries(this.enhancedTemplate)) {
      const azerbaijani = this.azerbaijaniTranslations[english];
      if (!azerbaijani) continue;
      
      const context = templateData.context;
      if (context && context.variables) {
        const issues = this.checkAzerbaijaniVariableHandling(english, azerbaijani, context.variables);
        if (issues.length > 0) {
          variableIssues.push({
            english,
            azerbaijani,
            variables: context.variables,
            issues,
            locations: templateData.description
          });
        }
      }
    }
    
    return variableIssues;
  }

  // Check Azerbaijani variable handling (cases, agreement, etc.)
  checkAzerbaijaniVariableHandling(english, azerbaijani, variables) {
    const issues = [];
    
    // Check for number-noun agreement issues
    for (const [varName, varInfo] of Object.entries(variables)) {
      if (varInfo.type === 'number') {
        if (!this.hasProperAzerbaijaniNumberAgreement(azerbaijani, varName)) {
          issues.push({
            type: 'number_agreement',
            variable: varName,
            message: 'Azerbaijani number-noun agreement may need attention',
            severity: 'high'
          });
        }
      }
      
      // Check for proper case usage with variables
      if (this.needsAzerbaijaniCaseAdjustment(azerbaijani, varName)) {
        issues.push({
          type: 'case_adjustment',
          variable: varName,
          message: 'Variable may need Azerbaijani case inflection in context',
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
      const azerbaijani = this.azerbaijaniTranslations[english];
      if (!azerbaijani) continue;
      
      const context = templateData.context;
      if (context && context.primary_ui_type === 'title') {
        const issues = this.checkAzerbaijaniTitle(english, azerbaijani);
        if (issues.length > 0) {
          titleIssues.push({
            english,
            azerbaijani,
            issues,
            locations: templateData.description
          });
        }
      }
    }
    
    return titleIssues;
  }

  // Check Azerbaijani title quality
  checkAzerbaijaniTitle(english, azerbaijani) {
    const issues = [];
    
    // Check capitalization (Azerbaijani uses sentence case)
    if (this.hasInappropriateAzerbaijaniCapitalization(azerbaijani)) {
      issues.push({
        type: 'capitalization',
        message: 'Azerbaijani titles typically use sentence case, not title case',
        severity: 'low'
      });
    }
    
    // Check for appropriate Azerbaijani terminology
    if (this.shouldUseNativeAzerbaijaniTerms(english, azerbaijani)) {
      issues.push({
        type: 'terminology',
        message: 'Consider using native Azerbaijani terminology instead of loanwords',
        severity: 'medium'
      });
    }
    
    return issues;
  }

  // Azerbaijani-specific helper methods
  hasAppropriateAzerbaijaniVerb(english, azerbaijani) {
    // Check for Azerbaijani imperative forms
    const azerbaijaniImperativePatterns = [
      /^[a-zəöüğışç]+$/,    // Simple imperative
      /^[a-zəöüğışç]+\s+[a-zəöüğışç]+$/,  // Two-word imperative
    ];
    
    const actionWords = ['add', 'save', 'delete', 'create', 'update', 'send', 'cancel'];
    if (actionWords.some(word => english.toLowerCase().includes(word))) {
      return azerbaijaniImperativePatterns.some(pattern => pattern.test(azerbaijani.toLowerCase())) ||
             azerbaijani.toLowerCase().match(/^(əlavə et|saxla|sil|yarat|yenilə|göndər|ləğv et)/);
    }
    
    return true; // Default to OK if not an action word
  }

  hasIncorrectAzerbaijaniCase(azerbaijani) {
    // Check for potential case usage issues
    // Azerbaijani cases: nominative, accusative, dative, locative, ablative, genitive
    const caseEndings = /\b\w+(ın|ın|un|ün|a|ə|ya|yə|da|də|nan|nən|dan|dən)\b/g;
    const matches = azerbaijani.match(caseEndings);
    
    if (matches) {
      // Very basic check for suspicious patterns
      return matches.some(match => match.length > 15); // Very long words might indicate incorrect case stacking
    }
    return false;
  }

  violatesAzerbaijaniVowelHarmony(azerbaijani) {
    // Check for vowel harmony violations
    const frontVowels = /[eəiöü]/;
    const backVowels = /[aıou]/;
    
    const words = azerbaijani.split(/\s+/);
    
    for (const word of words) {
      if (word.length > 3) { // Only check longer words
        const hasFront = frontVowels.test(word);
        const hasBack = backVowels.test(word);
        
        // Mixed front and back vowels in same word violates harmony
        if (hasFront && hasBack) {
          // Check if it's a compound word or loanword (more complex analysis needed)
          if (!word.includes('-') && word.length > 6) {
            return true;
          }
        }
      }
    }
    return false;
  }

  shouldPreferNativeAzerbaijaniTerms(english, azerbaijani) {
    // Check for opportunities to use native Azerbaijani terms instead of Turkish loanwords
    const turkishLoanwords = /(bilgisayar|internet|dosya|program)/;
    
    return turkishLoanwords.test(azerbaijani);
  }

  hasMissingDiacriticals(azerbaijani) {
    // Check if text should have diacriticals but is missing them
    // This is a very basic check - real implementation would need dictionary lookup
    const hasDiacriticals = /[əöüğışç]/.test(azerbaijani);
    const mightNeedDiacriticals = azerbaijani.length > 10 && /[aeiou]{2,}/.test(azerbaijani);
    
    return !hasDiacriticals && mightNeedDiacriticals;
  }

  hasInconsistentAzerbaijaniAddress(azerbaijani) {
    // Check for mixing formal/informal address
    const formalMarkers = /\b(siz|sizin|sizə|sizdən)\b/i;
    const informalMarkers = /\b(sən|sənin|sənə|səndən)\b/i;
    
    return formalMarkers.test(azerbaijani) && informalMarkers.test(azerbaijani);
  }

  hasProperAzerbaijaniNumberAgreement(azerbaijani, varName) {
    // Check for potential number agreement issues
    const numberVar = `{${varName}}`;
    if (azerbaijani.includes(numberVar)) {
      // Look for patterns that might indicate missing plural handling
      return !azerbaijani.match(new RegExp(`${numberVar}\\s+\\w+[^r]$`)); // Very basic check
    }
    return true;
  }

  needsAzerbaijaniCaseAdjustment(azerbaijani, varName) {
    const numberVar = `{${varName}}`;
    // Check if variable appears in context that might need case inflection
    return azerbaijani.includes(numberVar) && 
           azerbaijani.match(/\s(üçün|ilə|haqqında|kimi|qədər)\s/);
  }


  hasInappropriateAzerbaijaniCapitalization(azerbaijani) {
    // Check for English-style title case in Azerbaijani
    const words = azerbaijani.split(' ');
    if (words.length > 1) {
      // Count capitalized words (excluding first word)
      const capitalizedCount = words.slice(1).filter(word => 
        word.length > 2 && word[0] === word[0].toUpperCase()
      ).length;
      return capitalizedCount > 1; // More than 1 capitalized word suggests title case
    }
    return false;
  }

  shouldUseNativeAzerbaijaniTerms(english, azerbaijani) {
    // Check for excessive use of loanwords where native terms exist
    const loanwords = ['kompyuter', 'internet', 'email', 'fayl', 'proqram'];
    
    return loanwords.some(loanword => azerbaijani.toLowerCase().includes(loanword));
  }

  // Generate improvement recommendations
  generateRecommendations() {
    return [
      '• Use Azerbaijani sentence case for titles instead of English title case',
      '• Maintain consistency in formal/informal address (siz vs sən)',
      '• Use Azerbaijani imperative verb forms for action buttons',
      '• Pay careful attention to Azerbaijani case usage (6 cases available)',
      '• Ensure vowel harmony compliance (front/back vowel consistency)',
      '• Use proper Azerbaijani diacriticals (ə, ö, ü, ğ, ı, ş, ç)',
      '• Include polite language markers in error messages (xahiş edirəm, zəhmət olmasa)',
      '• Prefer native Azerbaijani terms over Turkish loanwords where appropriate',
      '• Ensure proper number-noun agreement for dynamic content',
      '• Check case inflection for variables in appropriate contexts'
    ];
  }

  // Main analysis function
  analyze() {
    console.log('🔍 Starting Azerbaijani translation analysis...\n');
    
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
    
    console.log('\n📊 AZERBAIJANI TRANSLATION ANALYSIS REPORT');
    console.log('==================================================');
    console.log(`Total improvement opportunities found: ${totalIssues}\n`);
    
    // Button issues
    if (buttonIssues.length > 0) {
      console.log(`🔘 BUTTON TRANSLATION ISSUES (${buttonIssues.length})`);
      console.log('------------------------------');
      buttonIssues.slice(0, 5).forEach((item, index) => {
        console.log(`${index + 1}. "${item.english}" → "${item.azerbaijani}"`);
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
        console.log(`${index + 1}. "${item.english}" → "${item.azerbaijani}"`);
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
        console.log(`${index + 1}. "${item.english}" → "${item.azerbaijani}"`);
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
    console.log('1. Focus on vowel harmony compliance (critical for Azerbaijani)');
    console.log('2. Review proper use of diacriticals (ə, ö, ü, ğ, ı, ş, ç)');
    console.log('3. Check case usage and variable inflection');
    console.log('5. Ensure formal/informal address consistency (siz vs sən)');
  }
}

// Run the analysis
if (require.main === module) {
  const analyzer = new AzerbaijaniTranslationAnalyzer();
  analyzer.analyze();
}

module.exports = AzerbaijaniTranslationAnalyzer;