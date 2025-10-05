'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Kyrgyz Translation Quality Analysis
 * 
 * Analyzes Kyrgyz translations against enhanced context to identify improvement opportunities
 * Focuses on Kyrgyz language-specific grammar, style, and cultural adaptation
 */

class KyrgyzTranslationAnalyzer {
  constructor() {
    this.enhancedTemplate = {};
    this.kyrgyzTranslations = {};
    this.issues = [];
    this.recommendations = [];
  }

  // Load enhanced template and Kyrgyz translations
  loadData() {
    try {
      const rootDir = path.join(__dirname, '../../');
      const enhancedContent = fs.readFileSync(path.join(rootDir, 'template.json'), 'utf8');
      this.enhancedTemplate = JSON.parse(enhancedContent);
      
      const kyrgyzContent = fs.readFileSync(path.join(rootDir, 'locales/ky.json'), 'utf8');
      this.kyrgyzTranslations = JSON.parse(kyrgyzContent);
      
      console.log(`📚 Loaded ${Object.keys(this.enhancedTemplate).length} enhanced template entries`);
      console.log(`🇰🇬 Loaded ${Object.keys(this.kyrgyzTranslations).length} Kyrgyz translations`);
    } catch (error) {
      console.error(`Error loading data: ${error.message}`);
      process.exit(1);
    }
  }

  // Check if Kyrgyz translation follows button text conventions
  analyzeButtonTranslations() {
    const buttonIssues = [];
    
    for (const [english, templateData] of Object.entries(this.enhancedTemplate)) {
      const kyrgyz = this.kyrgyzTranslations[english];
      if (!kyrgyz) continue;
      
      const context = templateData.context;
      if (context && context.primary_ui_type && context.primary_ui_type.includes('button')) {
        const issues = this.checkButtonTextQuality(english, kyrgyz, context);
        if (issues.length > 0) {
          buttonIssues.push({
            english,
            kyrgyz,
            context: context.primary_ui_type,
            issues,
            locations: templateData.description
          });
        }
      }
    }
    
    return buttonIssues;
  }

  // Check button text quality for Kyrgyz
  checkButtonTextQuality(english, kyrgyz, context) {
    const issues = [];
    
    // Check length - Kyrgyz can be longer than English
    if (kyrgyz.length > english.length * 2.5) {
      issues.push({
        type: 'length_concern',
        message: `Kyrgyz text significantly longer than English (${kyrgyz.length} vs ${english.length} chars)`,
        severity: 'medium'
      });
    }
    
    // Check for appropriate verb forms in action buttons (Kyrgyz imperative)
    if (context.primary_ui_type === 'submit_button' || context.primary_ui_type === 'action_button') {
      if (!this.hasAppropriateKyrgyzVerb(english, kyrgyz)) {
        issues.push({
          type: 'verb_form',
          message: 'Consider using Kyrgyz imperative verb form for action buttons',
          severity: 'low'
        });
      }
    }
    
    // Check for case usage (Kyrgyz has 6 cases)
    if (this.hasIncorrectKyrgyzCase(kyrgyz)) {
      issues.push({
        type: 'case_usage',
        message: 'Check Kyrgyz case usage (6 cases available)',
        severity: 'medium'
      });
    }
    
    // Check for vowel harmony
    if (this.violatesKyrgyzVowelHarmony(kyrgyz)) {
      issues.push({
        type: 'vowel_harmony',
        message: 'Check Kyrgyz vowel harmony compliance',
        severity: 'high'
      });
    }
    
    // Check for Cyrillic-specific characters (ң, ө, ү)
    if (this.hasMissingCyrillicCharacters(kyrgyz)) {
      issues.push({
        type: 'cyrillic_characters',
        message: 'Check proper use of Kyrgyz Cyrillic characters (ң, ө, ү)',
        severity: 'medium'
      });
    }
    
    // Check for Russian loanword usage vs native terms
    if (this.shouldPreferNativeKyrgyzTerms(english, kyrgyz)) {
      issues.push({
        type: 'native_vs_loanword',
        message: 'Consider using native Kyrgyz terms instead of Russian loanwords',
        severity: 'low'
      });
    }
    
    // Check for formal/informal address consistency (сиз/сен)
    if (this.hasInconsistentKyrgyzAddress(kyrgyz)) {
      issues.push({
        type: 'address_consistency',
        message: 'Check formal/informal address consistency (сиз/сен)',
        severity: 'medium'
      });
    }
    
    return issues;
  }

  // Check variable handling in Kyrgyz translations
  analyzeVariableHandling() {
    const variableIssues = [];
    
    for (const [english, templateData] of Object.entries(this.enhancedTemplate)) {
      const kyrgyz = this.kyrgyzTranslations[english];
      if (!kyrgyz) continue;
      
      const context = templateData.context;
      if (context && context.variables) {
        const issues = this.checkKyrgyzVariableHandling(english, kyrgyz, context.variables);
        if (issues.length > 0) {
          variableIssues.push({
            english,
            kyrgyz,
            variables: context.variables,
            issues,
            locations: templateData.description
          });
        }
      }
    }
    
    return variableIssues;
  }

  // Check Kyrgyz variable handling (cases, agreement, etc.)
  checkKyrgyzVariableHandling(english, kyrgyz, variables) {
    const issues = [];
    
    // Check for number-noun agreement issues
    for (const [varName, varInfo] of Object.entries(variables)) {
      if (varInfo.type === 'number') {
        if (!this.hasProperKyrgyzNumberAgreement(kyrgyz, varName)) {
          issues.push({
            type: 'number_agreement',
            variable: varName,
            message: 'Kyrgyz number-noun agreement may need attention',
            severity: 'high'
          });
        }
      }
      
      // Check for proper case usage with variables
      if (this.needsKyrgyzCaseAdjustment(kyrgyz, varName)) {
        issues.push({
          type: 'case_adjustment',
          variable: varName,
          message: 'Variable may need Kyrgyz case inflection in context',
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
      const kyrgyz = this.kyrgyzTranslations[english];
      if (!kyrgyz) continue;
      
      const context = templateData.context;
      if (context && context.primary_ui_type === 'title') {
        const issues = this.checkKyrgyzTitle(english, kyrgyz);
        if (issues.length > 0) {
          titleIssues.push({
            english,
            kyrgyz,
            issues,
            locations: templateData.description
          });
        }
      }
    }
    
    return titleIssues;
  }

  // Check Kyrgyz title quality
  checkKyrgyzTitle(english, kyrgyz) {
    const issues = [];
    
    // Check capitalization (Kyrgyz uses sentence case)
    if (this.hasInappropriateKyrgyzCapitalization(kyrgyz)) {
      issues.push({
        type: 'capitalization',
        message: 'Kyrgyz titles typically use sentence case, not title case',
        severity: 'low'
      });
    }
    
    // Check for appropriate Kyrgyz terminology
    if (this.shouldUseNativeKyrgyzTerms(english, kyrgyz)) {
      issues.push({
        type: 'terminology',
        message: 'Consider using native Kyrgyz terminology instead of loanwords',
        severity: 'medium'
      });
    }
    
    return issues;
  }

  // Kyrgyz-specific helper methods
  hasAppropriateKyrgyzVerb(english, kyrgyz) {
    // Check for Kyrgyz imperative forms
    const kyrgyzImperativePatterns = [
      /^[а-яёңөү]+$/,        // Simple imperative (Cyrillic)
      /^[а-яёңөү]+\s+[а-яёңөү]+$/,  // Two-word imperative
    ];
    
    const actionWords = ['add', 'save', 'delete', 'create', 'update', 'send', 'cancel'];
    if (actionWords.some(word => english.toLowerCase().includes(word))) {
      return kyrgyzImperativePatterns.some(pattern => pattern.test(kyrgyz.toLowerCase())) ||
             kyrgyz.toLowerCase().match(/^(кош|сакта|өчүр|түзү|жаңыла|жибер|жокко чыгар)/);
    }
    
    return true; // Default to OK if not an action word
  }

  hasIncorrectKyrgyzCase(kyrgyz) {
    // Check for potential case usage issues
    // Kyrgyz cases: nominative, accusative, genitive, dative, locative, ablative
    const caseEndings = /\b\w+(ны|нын|га|ге|да|де|дан|ден|тан|тен)\b/g;
    const matches = kyrgyz.match(caseEndings);
    
    if (matches) {
      // Very basic check for suspicious patterns
      return matches.some(match => match.length > 15); // Very long words might indicate incorrect case stacking
    }
    return false;
  }

  violatesKyrgyzVowelHarmony(kyrgyz) {
    // Check for vowel harmony violations in Kyrgyz
    const backVowels = /[аоуы]/;
    const frontVowels = /[эеүө]/;
    
    const words = kyrgyz.split(/\s+/);
    
    for (const word of words) {
      if (word.length > 3 && /[а-яёңөү]/.test(word)) { // Only check Cyrillic Kyrgyz words
        const hasBack = backVowels.test(word);
        const hasFront = frontVowels.test(word);
        
        // Mixed back and front vowels in same word violates harmony
        if (hasBack && hasFront) {
          // Check if it's a loanword or compound (more complex analysis needed)
          if (word.length > 6 && !word.includes('-')) {
            return true;
          }
        }
      }
    }
    return false;
  }

  hasMissingCyrillicCharacters(kyrgyz) {
    // Check if text should have Kyrgyz-specific Cyrillic characters but is missing them
    const hasKyrgyzChars = /[ңөү]/.test(kyrgyz);
    const hasCyrillic = /[а-яё]/.test(kyrgyz);
    const mightNeedKyrgyzChars = hasCyrillic && kyrgyz.length > 10;
    
    return mightNeedKyrgyzChars && !hasKyrgyzChars;
  }

  shouldPreferNativeKyrgyzTerms(english, kyrgyz) {
    // Check for opportunities to use native Kyrgyz terms instead of Russian loanwords
    const russianLoanwords = /(компьютер|интернет|файл|программа|система)/;
    
    return russianLoanwords.test(kyrgyz);
  }

  hasInconsistentKyrgyzAddress(kyrgyz) {
    // Check for mixing formal/informal address
    const formalMarkers = /\b(сиз|сиздин|сизге|сизден)\b/i;
    const informalMarkers = /\b(сен|сенин|сага|сенден)\b/i;
    
    return formalMarkers.test(kyrgyz) && informalMarkers.test(kyrgyz);
  }

  hasProperKyrgyzNumberAgreement(kyrgyz, varName) {
    // Check for potential number agreement issues
    const numberVar = `{${varName}}`;
    if (kyrgyz.includes(numberVar)) {
      // Look for patterns that might indicate missing plural handling
      return !kyrgyz.match(new RegExp(`${numberVar}\\s+\\w+[^р]$`)); // Very basic check
    }
    return true;
  }

  needsKyrgyzCaseAdjustment(kyrgyz, varName) {
    const numberVar = `{${varName}}`;
    // Check if variable appears in context that might need case inflection
    return kyrgyz.includes(numberVar) && 
           kyrgyz.match(/\s(үчүн|менен|тууралуу|сыяктуу|чейин)\s/);
  }


  hasInappropriateKyrgyzCapitalization(kyrgyz) {
    // Check for English-style title case in Kyrgyz
    const words = kyrgyz.split(' ');
    if (words.length > 1) {
      // Count capitalized words (excluding first word)
      const capitalizedCount = words.slice(1).filter(word => 
        word.length > 2 && word[0] === word[0].toUpperCase()
      ).length;
      return capitalizedCount > 1; // More than 1 capitalized word suggests title case
    }
    return false;
  }

  shouldUseNativeKyrgyzTerms(english, kyrgyz) {
    // Check for excessive use of loanwords where native terms exist
    const loanwords = ['компьютер', 'интернет', 'электрондук почта', 'файл', 'программа'];
    
    return loanwords.some(loanword => kyrgyz.toLowerCase().includes(loanword));
  }

  // Generate improvement recommendations
  generateRecommendations() {
    return [
      '• Use Kyrgyz sentence case for titles instead of English title case',
      '• Maintain consistency in formal/informal address (сиз vs сен)',
      '• Use Kyrgyz imperative verb forms for action buttons',
      '• Pay careful attention to Kyrgyz case usage (6 cases available)',
      '• Ensure vowel harmony compliance in Kyrgyz words',
      '• Use proper Kyrgyz Cyrillic characters (ң, ө, ү) where appropriate',
      '• Include polite language markers in error messages (сураныч, кечиресиз)',
      '• Prefer native Kyrgyz terms over Russian loanwords where appropriate',
      '• Ensure proper number-noun agreement for dynamic content',
      '• Check case inflection for variables in appropriate contexts'
    ];
  }

  // Main analysis function
  analyze() {
    console.log('🔍 Starting Kyrgyz translation analysis...\n');
    
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
    
    console.log('\n📊 KYRGYZ TRANSLATION ANALYSIS REPORT');
    console.log('==================================================');
    console.log(`Total improvement opportunities found: ${totalIssues}\n`);
    
    // Button issues
    if (buttonIssues.length > 0) {
      console.log(`🔘 BUTTON TRANSLATION ISSUES (${buttonIssues.length})`);
      console.log('------------------------------');
      buttonIssues.slice(0, 5).forEach((item, index) => {
        console.log(`${index + 1}. "${item.english}" → "${item.kyrgyz}"`);
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
        console.log(`${index + 1}. "${item.english}" → "${item.kyrgyz}"`);
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
        console.log(`${index + 1}. "${item.english}" → "${item.kyrgyz}"`);
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
    console.log('1. Focus on vowel harmony compliance (critical for Kyrgyz)');
    console.log('2. Review proper use of Kyrgyz Cyrillic characters (ң, ө, ү)');
    console.log('3. Check case usage and variable inflection');
    console.log('5. Ensure formal/informal address consistency (сиз vs сен)');
  }
}

// Run the analysis
if (require.main === module) {
  const analyzer = new KyrgyzTranslationAnalyzer();
  analyzer.analyze();
}

module.exports = KyrgyzTranslationAnalyzer;