'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Lithuanian Translation Quality Analysis
 * 
 * Analyzes Lithuanian translations against enhanced context to identify improvement opportunities
 * Focuses on Lithuanian language-specific grammar, style, and cultural adaptation
 */

class LithuanianTranslationAnalyzer {
  constructor() {
    this.enhancedTemplate = {};
    this.lithuanianTranslations = {};
    this.issues = [];
    this.recommendations = [];
  }

  // Load enhanced template and Lithuanian translations
  loadData() {
    try {
      const rootDir = path.join(__dirname, '../../');
      const enhancedContent = fs.readFileSync(path.join(rootDir, 'template.json'), 'utf8');
      this.enhancedTemplate = JSON.parse(enhancedContent);
      
      const lithuanianContent = fs.readFileSync(path.join(rootDir, 'locales/lt.json'), 'utf8');
      this.lithuanianTranslations = JSON.parse(lithuanianContent);
      
      console.log(`📚 Loaded ${Object.keys(this.enhancedTemplate).length} enhanced template entries`);
      console.log(`🇱🇹 Loaded ${Object.keys(this.lithuanianTranslations).length} Lithuanian translations`);
    } catch (error) {
      console.error(`Error loading data: ${error.message}`);
      process.exit(1);
    }
  }

  // Check if Lithuanian translation follows button text conventions
  analyzeButtonTranslations() {
    const buttonIssues = [];
    
    for (const [english, templateData] of Object.entries(this.enhancedTemplate)) {
      const lithuanian = this.lithuanianTranslations[english];
      if (!lithuanian) continue;
      
      const context = templateData.context;
      if (context && context.primary_ui_type && context.primary_ui_type.includes('button')) {
        const issues = this.checkButtonTextQuality(english, lithuanian, context);
        if (issues.length > 0) {
          buttonIssues.push({
            english,
            lithuanian,
            context: context.primary_ui_type,
            issues,
            locations: templateData.description
          });
        }
      }
    }
    
    return buttonIssues;
  }

  // Check button text quality for Lithuanian
  checkButtonTextQuality(english, lithuanian, context) {
    const issues = [];
    
    // Check length - Lithuanian tends to be longer than English
    if (lithuanian.length > english.length * 3.5) {
      issues.push({
        type: 'length_concern',
        message: `Lithuanian text significantly longer than English (${lithuanian.length} vs ${english.length} chars)`,
        severity: 'medium'
      });
    }
    
    // Check for appropriate verb forms in action buttons (Lithuanian infinitive or imperative)
    if (context.primary_ui_type === 'submit_button' || context.primary_ui_type === 'action_button') {
      if (!this.hasAppropriateLithuanianVerb(english, lithuanian)) {
        issues.push({
          type: 'verb_form',
          message: 'Consider using Lithuanian infinitive (-ti) or imperative verb form for action buttons',
          severity: 'low'
        });
      }
    }
    
    // Check for case consistency (Lithuanian has 7 cases)
    if (this.hasInconsistentLithuanianCase(lithuanian)) {
      issues.push({
        type: 'case_consistency',
        message: 'Check Lithuanian case usage - ensure consistency with grammatical context',
        severity: 'medium'
      });
    }
    
    // Check for gender agreement issues
    if (this.hasGenderAgreementIssues(lithuanian)) {
      issues.push({
        type: 'gender_agreement',
        message: 'Check Lithuanian gender agreement (masculine/feminine) in adjectives and participles',
        severity: 'medium'
      });
    }
    
    // Check for proper diacritical usage
    if (this.missingLithuanianDiacriticals(english, lithuanian)) {
      issues.push({
        type: 'diacriticals',
        message: 'Check Lithuanian diacritical marks (ą, č, ę, ė, į, š, ų, ū, ž)',
        severity: 'high'
      });
    }
    
    return issues;
  }

  // Check variable handling in Lithuanian translations
  analyzeVariableHandling() {
    const variableIssues = [];
    
    for (const [english, templateData] of Object.entries(this.enhancedTemplate)) {
      const lithuanian = this.lithuanianTranslations[english];
      if (!lithuanian) continue;
      
      const context = templateData.context;
      if (context && context.variables) {
        const issues = this.checkLithuanianVariableHandling(english, lithuanian, context.variables);
        if (issues.length > 0) {
          variableIssues.push({
            english,
            lithuanian,
            variables: context.variables,
            issues,
            locations: templateData.description
          });
        }
      }
    }
    
    return variableIssues;
  }

  // Check Lithuanian variable handling (cases, gender agreement, dual forms, etc.)
  checkLithuanianVariableHandling(english, lithuanian, variables) {
    const issues = [];
    
    // Check for number-noun agreement issues (including dual forms)
    for (const [varName, varInfo] of Object.entries(variables)) {
      if (varInfo.type === 'number') {
        if (!this.hasProperLithuanianNumberAgreement(lithuanian, varName)) {
          issues.push({
            type: 'number_agreement',
            variable: varName,
            message: 'Lithuanian number-noun agreement may need attention (singular/dual/plural forms)',
            severity: 'high'
          });
        }
      }
      
      // Check for proper case usage with variables
      if (varInfo.type === 'string' && this.needsLithuanianCaseAdjustment(lithuanian, varName)) {
        issues.push({
          type: 'case_adjustment',
          variable: varName,
          message: 'Variable may need Lithuanian case inflection in grammatical context',
          severity: 'medium'
        });
      }
      
      // Check for gender agreement with variables
      if (this.needsLithuanianGenderAgreement(lithuanian, varName)) {
        issues.push({
          type: 'gender_agreement',
          variable: varName,
          message: 'Variable may need gender agreement in Lithuanian context',
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
      const lithuanian = this.lithuanianTranslations[english];
      if (!lithuanian) continue;
      
      const context = templateData.context;
      if (context && context.primary_ui_type === 'title') {
        const issues = this.checkLithuanianTitle(english, lithuanian);
        if (issues.length > 0) {
          titleIssues.push({
            english,
            lithuanian,
            issues,
            locations: templateData.description
          });
        }
      }
    }
    
    return titleIssues;
  }

  // Check Lithuanian title quality
  checkLithuanianTitle(english, lithuanian) {
    const issues = [];
    
    // Check capitalization (Lithuanian uses sentence case)
    if (this.hasInappropriateLithuanianCapitalization(lithuanian)) {
      issues.push({
        type: 'capitalization',
        message: 'Lithuanian titles typically use sentence case, not title case',
        severity: 'low'
      });
    }
    
    // Check for appropriate Lithuanian terminology
    if (this.shouldUseNativeLithuanianTerms(english, lithuanian)) {
      issues.push({
        type: 'terminology',
        message: 'Consider using native Lithuanian terminology instead of loanwords',
        severity: 'medium'
      });
    }
    
    // Check for diminutive form appropriateness
    if (this.shouldUseLithuanianDiminutive(english, lithuanian)) {
      issues.push({
        type: 'diminutive',
        message: 'Consider Lithuanian diminutive forms for more natural expression',
        severity: 'low'
      });
    }
    
    return issues;
  }

  // Lithuanian-specific helper methods
  hasAppropriateLithuanianVerb(english, lithuanian) {
    // Check for Lithuanian infinitive forms (-ti) or imperative mood
    const lithuanianInfinitivePatterns = [
      /ti$/, /dyti$/, /ėti$/,    // infinitive endings
      /k$/, /kie$/,             // imperative forms
    ];
    
    const actionWords = ['add', 'save', 'delete', 'create', 'update', 'send', 'cancel'];
    if (actionWords.some(word => english.toLowerCase().includes(word))) {
      return lithuanianInfinitivePatterns.some(pattern => pattern.test(lithuanian.toLowerCase()));
    }
    
    return true; // Default to OK if not an action word
  }

  hasInconsistentLithuanianCase(lithuanian) {
    // Basic check for potential case inconsistencies
    // Check for inappropriate mixing of different case patterns
    return lithuanian.includes('_') || lithuanian.match(/[A-ZĄČĘĖĮŠŲŪŽ]{3,}/);
  }

  hasGenderAgreementIssues(lithuanian) {
    // Check for potential gender agreement issues
    // Look for patterns that might indicate gender disagreement
    const mismatchPatterns = [
      /as\s+[^aeiouąęėįųū]/i,  // masculine ending with non-masculine modifier
      /ė\s+[^aeiouąęėįųū]/i,   // feminine ending with non-feminine modifier
    ];
    
    return mismatchPatterns.some(pattern => pattern.test(lithuanian));
  }

  missingLithuanianDiacriticals(english, lithuanian) {
    // Check if Lithuanian text might be missing diacriticals
    const suspiciousPatterns = [
      /[aeiu]{2,}/,  // Double vowels that should probably be with diacriticals
      /ch(?![aeiou])/,  // 'ch' should probably be 'č'
      /sh(?![aeiou])/,  // 'sh' should probably be 'š'
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(lithuanian.toLowerCase()));
  }

  hasProperLithuanianNumberAgreement(lithuanian, varName) {
    // Check for Lithuanian number agreement including dual forms
    const numberVar = `{${varName}}`;
    if (lithuanian.includes(numberVar)) {
      // Lithuanian has special dual number forms (for 2, 12, 22, etc.)
      // This is a simplified check
      return !lithuanian.match(new RegExp(`${numberVar}\\s+\\w+[^ųių]$`));
    }
    return true;
  }

  needsLithuanianCaseAdjustment(lithuanian, varName) {
    const variablePattern = `{${varName}}`;
    // Check if variable appears in context that requires specific case
    const caseRequiringContexts = [
      /\s(su|be|iš|į|ant|po|per|dėl|kaip)\s/,  // prepositions requiring specific cases
      /\s(nuo|iki|apie|prie|ties)\s/,          // more prepositions
    ];
    
    return lithuanian.includes(variablePattern) && 
           caseRequiringContexts.some(pattern => pattern.test(lithuanian));
  }

  needsLithuanianGenderAgreement(lithuanian, varName) {
    const variablePattern = `{${varName}}`;
    // Check if variable appears with adjectives that need gender agreement
    return lithuanian.includes(variablePattern) && 
           lithuanian.match(/\s(naujas|senas|geras|blogas|didelis|mažas)\s/);
  }

  isLithuanianErrorTooAbrupt(lithuanian) {
    // Check if error message is too abrupt
    const abruptPatterns = ['klaida', 'neįmanoma', 'draudžiama', 'netinkamas'];
    // Check for polite language markers in Lithuanian
    return abruptPatterns.some(pattern => {
      return lithuanian.toLowerCase().startsWith(pattern) && !lithuanian.includes('prašome');
    });
  }


  hasInappropriateLithuanianCapitalization(lithuanian) {
    // Check for English-style title case in Lithuanian
    const words = lithuanian.split(' ');
    if (words.length > 1) {
      // Count capitalized words (excluding first word)
      const capitalizedCount = words.slice(1).filter(word => 
        word.length > 2 && word[0] === word[0].toUpperCase()
      ).length;
      return capitalizedCount > 1; // More than 1 capitalized word suggests title case
    }
    return false;
  }

  shouldUseNativeLithuanianTerms(english, lithuanian) {
    // Check for excessive use of loanwords where native terms exist
    const loanwords = ['kompiuteris', 'internetas', 'emailas', 'failas'];
    
    return loanwords.some(loanword => lithuanian.toLowerCase().includes(loanword));
  }

  shouldUseLithuanianDiminutive(english, lithuanian) {
    // Check if diminutive forms would be more appropriate
    // Lithuanian frequently uses diminutives for friendlier tone
    return english.toLowerCase().includes('small') && !lithuanian.match(/[ėė]lis|[uū]kas|ytė$/);
  }

  // Generate improvement recommendations
  generateRecommendations() {
    return [
      '• Use Lithuanian sentence case for titles instead of English title case',
      '• Prefer native Lithuanian terms over loanwords when available',
      '• Use infinitive (-ti) or imperative forms for action buttons',
      '• Pay attention to Lithuanian case agreement with variables (7 cases)',
      '• Include polite language markers in error messages (prašome, atsiprašome)',
      '• Ensure proper gender agreement between nouns and adjectives',
      '• Consider dual number forms for quantities of 2, 12, 22, etc.',
      '• Use proper Lithuanian diacritical marks (ą, č, ę, ė, į, š, ų, ū, ž)',
      '• Use formal "jūs" form in professional contexts',
      '• Consider Lithuanian diminutive forms for friendlier tone',
      '• Check verb aspect usage (perfective/imperfective) for proper meaning'
    ];
  }

  // Main analysis function
  analyze() {
    console.log('🔍 Starting Lithuanian translation analysis...\n');
    
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
    
    console.log('\n📊 LITHUANIAN TRANSLATION ANALYSIS REPORT');
    console.log('==================================================');
    console.log(`Total improvement opportunities found: ${totalIssues}\n`);
    
    // Button issues
    if (buttonIssues.length > 0) {
      console.log(`🔘 BUTTON TRANSLATION ISSUES (${buttonIssues.length})`);
      console.log('------------------------------');
      buttonIssues.slice(0, 5).forEach((item, index) => {
        console.log(`${index + 1}. "${item.english}" → "${item.lithuanian}"`);
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
        console.log(`${index + 1}. "${item.english}" → "${item.lithuanian}"`);
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
        console.log(`${index + 1}. "${item.english}" → "${item.lithuanian}"`);
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
    console.log('2. Review button text for Lithuanian infinitive or imperative forms');
    console.log('3. Ensure proper diacritical marks usage');
    console.log('4. Check dual number forms for quantities of 2, 12, 22, etc.');
    console.log('6. Standardize title capitalization to Lithuanian conventions');
  }
}

// Run the analysis
if (require.main === module) {
  const analyzer = new LithuanianTranslationAnalyzer();
  analyzer.analyze();
}

module.exports = LithuanianTranslationAnalyzer;