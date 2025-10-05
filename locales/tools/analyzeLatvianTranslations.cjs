'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Latvian Translation Quality Analysis
 * 
 * Analyzes Latvian translations against enhanced context to identify improvement opportunities
 * Focuses on Latvian language-specific grammar, style, and cultural adaptation
 */

class LatvianTranslationAnalyzer {
  constructor() {
    this.enhancedTemplate = {};
    this.latvianTranslations = {};
    this.issues = [];
    this.recommendations = [];
  }

  // Load enhanced template and Latvian translations
  loadData() {
    try {
      const rootDir = path.join(__dirname, '../../');
      const enhancedContent = fs.readFileSync(path.join(rootDir, 'template.json'), 'utf8');
      this.enhancedTemplate = JSON.parse(enhancedContent);
      
      const latvianContent = fs.readFileSync(path.join(rootDir, 'locales/lv.json'), 'utf8');
      this.latvianTranslations = JSON.parse(latvianContent);
      
      console.log(`📚 Loaded ${Object.keys(this.enhancedTemplate).length} enhanced template entries`);
      console.log(`🇱🇻 Loaded ${Object.keys(this.latvianTranslations).length} Latvian translations`);
    } catch (error) {
      console.error(`Error loading data: ${error.message}`);
      process.exit(1);
    }
  }

  // Check if Latvian translation follows button text conventions
  analyzeButtonTranslations() {
    const buttonIssues = [];
    
    for (const [english, templateData] of Object.entries(this.enhancedTemplate)) {
      const latvian = this.latvianTranslations[english];
      if (!latvian) continue;
      
      const context = templateData.context;
      if (context && context.primary_ui_type && context.primary_ui_type.includes('button')) {
        const issues = this.checkButtonTextQuality(english, latvian, context);
        if (issues.length > 0) {
          buttonIssues.push({
            english,
            latvian,
            context: context.primary_ui_type,
            issues,
            locations: templateData.description
          });
        }
      }
    }
    
    return buttonIssues;
  }

  // Check button text quality for Latvian
  checkButtonTextQuality(english, latvian, context) {
    const issues = [];
    
    // Check length - Latvian tends to be longer than English
    if (latvian.length > english.length * 3.2) {
      issues.push({
        type: 'length_concern',
        message: `Latvian text significantly longer than English (${latvian.length} vs ${english.length} chars)`,
        severity: 'medium'
      });
    }
    
    // Check for appropriate verb forms in action buttons (Latvian infinitive or imperative)
    if (context.primary_ui_type === 'submit_button' || context.primary_ui_type === 'action_button') {
      if (!this.hasAppropriateLatvianVerb(english, latvian)) {
        issues.push({
          type: 'verb_form',
          message: 'Consider using Latvian infinitive (-t) or imperative verb form for action buttons',
          severity: 'low'
        });
      }
    }
    
    // Check for case consistency (Latvian has 6 cases)
    if (this.hasInconsistentLatvianCase(latvian)) {
      issues.push({
        type: 'case_consistency',
        message: 'Check Latvian case usage - ensure consistency with grammatical context',
        severity: 'medium'
      });
    }
    
    // Check for gender agreement issues
    if (this.hasGenderAgreementIssues(latvian)) {
      issues.push({
        type: 'gender_agreement',
        message: 'Check Latvian gender agreement (masculine/feminine) in adjectives',
        severity: 'medium'
      });
    }
    
    // Check for proper diacritical and long vowel usage
    if (this.missingLatvianDiacriticals(english, latvian)) {
      issues.push({
        type: 'diacriticals',
        message: 'Check Latvian diacritical marks and long vowels (ā, ē, ī, ō, ū, ģ, ķ, ļ, ņ, š, ž, č)',
        severity: 'high'
      });
    }
    
    // Check for palatalization patterns
    if (this.hasIncorrectPalatalization(latvian)) {
      issues.push({
        type: 'palatalization',
        message: 'Check Latvian palatalization rules and consonant softening',
        severity: 'medium'
      });
    }
    
    return issues;
  }

  // Check variable handling in Latvian translations
  analyzeVariableHandling() {
    const variableIssues = [];
    
    for (const [english, templateData] of Object.entries(this.enhancedTemplate)) {
      const latvian = this.latvianTranslations[english];
      if (!latvian) continue;
      
      const context = templateData.context;
      if (context && context.variables) {
        const issues = this.checkLatvianVariableHandling(english, latvian, context.variables);
        if (issues.length > 0) {
          variableIssues.push({
            english,
            latvian,
            variables: context.variables,
            issues,
            locations: templateData.description
          });
        }
      }
    }
    
    return variableIssues;
  }

  // Check Latvian variable handling (cases, gender agreement, etc.)
  checkLatvianVariableHandling(english, latvian, variables) {
    const issues = [];
    
    // Check for number-noun agreement issues
    for (const [varName, varInfo] of Object.entries(variables)) {
      if (varInfo.type === 'number') {
        if (!this.hasProperLatvianNumberAgreement(latvian, varName)) {
          issues.push({
            type: 'number_agreement',
            variable: varName,
            message: 'Latvian number-noun agreement may need attention (singular/plural forms)',
            severity: 'high'
          });
        }
      }
      
      // Check for proper case usage with variables
      if (varInfo.type === 'string' && this.needsLatvianCaseAdjustment(latvian, varName)) {
        issues.push({
          type: 'case_adjustment',
          variable: varName,
          message: 'Variable may need Latvian case inflection in grammatical context',
          severity: 'medium'
        });
      }
      
      // Check for gender agreement with variables
      if (this.needsLatvianGenderAgreement(latvian, varName)) {
        issues.push({
          type: 'gender_agreement',
          variable: varName,
          message: 'Variable may need gender agreement in Latvian context',
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
      const latvian = this.latvianTranslations[english];
      if (!latvian) continue;
      
      const context = templateData.context;
      if (context && context.primary_ui_type === 'title') {
        const issues = this.checkLatvianTitle(english, latvian);
        if (issues.length > 0) {
          titleIssues.push({
            english,
            latvian,
            issues,
            locations: templateData.description
          });
        }
      }
    }
    
    return titleIssues;
  }

  // Check Latvian title quality
  checkLatvianTitle(english, latvian) {
    const issues = [];
    
    // Check capitalization (Latvian uses sentence case)
    if (this.hasInappropriateLatvianCapitalization(latvian)) {
      issues.push({
        type: 'capitalization',
        message: 'Latvian titles typically use sentence case, not title case',
        severity: 'low'
      });
    }
    
    // Check for appropriate Latvian terminology
    if (this.shouldUseNativeLatvianTerms(english, latvian)) {
      issues.push({
        type: 'terminology',
        message: 'Consider using native Latvian terminology instead of loanwords',
        severity: 'medium'
      });
    }
    
    return issues;
  }

  // Latvian-specific helper methods
  hasAppropriateLatvianVerb(english, latvian) {
    // Check for Latvian infinitive forms (-t) or imperative mood
    const latvianVerbPatterns = [
      /t$/, /īt$/, /ēt$/,        // infinitive endings
      /i$/, /iet$/,             // imperative forms
    ];
    
    const actionWords = ['add', 'save', 'delete', 'create', 'update', 'send', 'cancel'];
    if (actionWords.some(word => english.toLowerCase().includes(word))) {
      return latvianVerbPatterns.some(pattern => pattern.test(latvian.toLowerCase()));
    }
    
    return true; // Default to OK if not an action word
  }

  hasInconsistentLatvianCase(latvian) {
    // Basic check for potential case inconsistencies
    // Check for inappropriate mixing of different case patterns
    return latvian.includes('_') || latvian.match(/[A-ZĀĒĪŌŪĢĶĻŅŠŽČ]{3,}/);
  }

  hasGenderAgreementIssues(latvian) {
    // Check for potential gender agreement issues
    // Look for patterns that might indicate gender disagreement
    const mismatchPatterns = [
      /s\s+[aāeēiī]/i,  // masculine ending with feminine modifier
      /a\s+[aāeēiī]/i,  // feminine ending with masculine modifier
    ];
    
    return mismatchPatterns.some(pattern => pattern.test(latvian));
  }

  missingLatvianDiacriticals(english, latvian) {
    // Check if Latvian text might be missing diacriticals or long vowels
    const suspiciousPatterns = [
      /[aeiou]{2,}/,    // Double vowels that should probably be long vowels
      /g(?![aeiouāēīōū])/,  // 'g' that should probably be 'ģ'
      /k(?![aeiouāēīōū])/,  // 'k' that should probably be 'ķ'
      /l(?![aeiouāēīōū])/,  // 'l' that should probably be 'ļ'
      /n(?![aeiouāēīōū])/,  // 'n' that should probably be 'ņ'
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(latvian.toLowerCase()));
  }

  hasIncorrectPalatalization(latvian) {
    // Check for potential palatalization issues
    // This is a simplified check for consonant softening patterns
    const palatalizationPatterns = [
      /[ģķļņ][bcdfghjklmnpqrstvwxyz]/,  // Softened consonants before hard consonants
      /[gkln][iīeē]/,                   // Hard consonants that might need softening before front vowels
    ];
    
    return palatalizationPatterns.some(pattern => pattern.test(latvian.toLowerCase()));
  }

  hasProperLatvianNumberAgreement(latvian, varName) {
    // Check for Latvian number agreement
    const numberVar = `{${varName}}`;
    if (latvian.includes(numberVar)) {
      // Check for patterns that might indicate missing number agreement
      return !latvian.match(new RegExp(`${numberVar}\\s+\\w+[^siuām]$`));
    }
    return true;
  }

  needsLatvianCaseAdjustment(latvian, varName) {
    const variablePattern = `{${varName}}`;
    // Check if variable appears in context that requires specific case
    const caseRequiringContexts = [
      /\s(ar|bez|no|uz|pie|par|pēc|līdz)\s/,  // prepositions requiring specific cases
      /\s(caur|dēļ|labad|vietā)\s/,           // more prepositions
    ];
    
    return latvian.includes(variablePattern) && 
           caseRequiringContexts.some(pattern => pattern.test(latvian));
  }

  needsLatvianGenderAgreement(latvian, varName) {
    const variablePattern = `{${varName}}`;
    // Check if variable appears with adjectives that need gender agreement
    return latvian.includes(variablePattern) && 
           latvian.match(/\s(jauns|vecs|labs|slikts|liels|mazs)\s/);
  }


  hasInappropriateLatvianCapitalization(latvian) {
    // Check for English-style title case in Latvian
    const words = latvian.split(' ');
    if (words.length > 1) {
      // Count capitalized words (excluding first word)
      const capitalizedCount = words.slice(1).filter(word => 
        word.length > 2 && word[0] === word[0].toUpperCase()
      ).length;
      return capitalizedCount > 1; // More than 1 capitalized word suggests title case
    }
    return false;
  }

  shouldUseNativeLatvianTerms(english, latvian) {
    // Check for excessive use of loanwords where native terms exist
    const loanwords = ['kompjūters', 'internets', 'emeils', 'fails'];
    
    return loanwords.some(loanword => latvian.toLowerCase().includes(loanword));
  }

  // Generate improvement recommendations
  generateRecommendations() {
    return [
      '• Use Latvian sentence case for titles instead of English title case',
      '• Prefer native Latvian terms over loanwords when available',
      '• Use infinitive (-t) or imperative forms for action buttons',
      '• Pay attention to Latvian case agreement with variables (6 cases)',
      '• Include polite language markers in error messages (lūdzu, atvainojiet)',
      '• Ensure proper gender agreement between nouns and adjectives',
      '• Use proper Latvian diacritical marks and long vowels (ā, ē, ī, ō, ū)',
      '• Check consonant softening patterns (ģ, ķ, ļ, ņ, š, ž, č)',
      '• Use formal "jūs" form in professional contexts',
      '• Follow Latvian palatalization rules correctly',
      '• Check verb mood usage (indicative/conditional/imperative) for proper meaning'
    ];
  }

  // Main analysis function
  analyze() {
    console.log('🔍 Starting Latvian translation analysis...\n');
    
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
    
    console.log('\n📊 LATVIAN TRANSLATION ANALYSIS REPORT');
    console.log('==================================================');
    console.log(`Total improvement opportunities found: ${totalIssues}\n`);
    
    // Button issues
    if (buttonIssues.length > 0) {
      console.log(`🔘 BUTTON TRANSLATION ISSUES (${buttonIssues.length})`);
      console.log('------------------------------');
      buttonIssues.slice(0, 5).forEach((item, index) => {
        console.log(`${index + 1}. "${item.english}" → "${item.latvian}"`);
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
        console.log(`${index + 1}. "${item.english}" → "${item.latvian}"`);
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
        console.log(`${index + 1}. "${item.english}" → "${item.latvian}"`);
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
    console.log('1. Focus on case agreement and gender agreement issues first');
    console.log('2. Review button text for Latvian infinitive or imperative forms');
    console.log('3. Ensure proper diacritical marks and long vowel usage');
    console.log('4. Check consonant palatalization and softening rules');
    console.log('6. Standardize title capitalization to Latvian conventions');
  }
}

// Run the analysis
if (require.main === module) {
  const analyzer = new LatvianTranslationAnalyzer();
  analyzer.analyze();
}

module.exports = LatvianTranslationAnalyzer;