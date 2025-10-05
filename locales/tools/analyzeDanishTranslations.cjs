'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Danish Translation Quality Analysis
 * 
 * Analyzes Danish translations against enhanced context to identify improvement opportunities
 * Focuses on Danish language-specific grammar, style, and cultural adaptation
 */

class DanishTranslationAnalyzer {
  constructor() {
    this.enhancedTemplate = {};
    this.danishTranslations = {};
    this.issues = [];
    this.recommendations = [];
  }

  // Load enhanced template and Danish translations
  loadData() {
    try {
      const rootDir = path.join(__dirname, '../../');
      const enhancedContent = fs.readFileSync(path.join(rootDir, 'template.json'), 'utf8');
      this.enhancedTemplate = JSON.parse(enhancedContent);
      
      const danishContent = fs.readFileSync(path.join(rootDir, 'locales/da.json'), 'utf8');
      this.danishTranslations = JSON.parse(danishContent);
      
      console.log(`📚 Loaded ${Object.keys(this.enhancedTemplate).length} enhanced template entries`);
      console.log(`🇩🇰 Loaded ${Object.keys(this.danishTranslations).length} Danish translations`);
    } catch (error) {
      console.error(`Error loading data: ${error.message}`);
      process.exit(1);
    }
  }

  // Check if Danish translation follows button text conventions
  analyzeButtonTranslations() {
    const buttonIssues = [];
    
    for (const [english, templateData] of Object.entries(this.enhancedTemplate)) {
      const danish = this.danishTranslations[english];
      if (!danish) continue;
      
      const context = templateData.context;
      if (context && context.primary_ui_type && context.primary_ui_type.includes('button')) {
        const issues = this.checkButtonTextQuality(english, danish, context);
        if (issues.length > 0) {
          buttonIssues.push({
            english,
            danish,
            context: context.primary_ui_type,
            issues,
            locations: templateData.description
          });
        }
      }
    }
    
    return buttonIssues;
  }

  // Check button text quality for Danish
  checkButtonTextQuality(english, danish, context) {
    const issues = [];
    
    // Check length - Danish can be longer than English
    if (danish.length > english.length * 2.5) {
      issues.push({
        type: 'length_concern',
        message: `Danish text significantly longer than English (${danish.length} vs ${english.length} chars)`,
        severity: 'medium'
      });
    }
    
    // Check for appropriate verb forms in action buttons (Danish imperative)
    if (context.primary_ui_type === 'submit_button' || context.primary_ui_type === 'action_button') {
      if (!this.hasAppropriateDanishVerb(english, danish)) {
        issues.push({
          type: 'verb_form',
          message: 'Consider using Danish imperative verb form for action buttons',
          severity: 'low'
        });
      }
    }
    
    // Check for definite article suffix usage (-en, -et, -ene, -ne)
    if (this.hasIncorrectDanishDefiniteArticle(danish)) {
      issues.push({
        type: 'definite_article',
        message: 'Check Danish definite article suffix usage (-en, -et, -ene, -ne)',
        severity: 'medium'
      });
    }
    
    // Check for compound word appropriateness
    if (this.shouldUseDanishCompound(english, danish)) {
      issues.push({
        type: 'compound_word',
        message: 'Consider Danish compound word construction for better readability',
        severity: 'low'
      });
    }
    
    // Check for formal/informal address consistency (De/du)
    if (this.hasInconsistentDanishAddress(danish)) {
      issues.push({
        type: 'address_consistency',
        message: 'Check formal/informal address consistency (De/du)',
        severity: 'medium'
      });
    }
    
    return issues;
  }

  // Check variable handling in Danish translations
  analyzeVariableHandling() {
    const variableIssues = [];
    
    for (const [english, templateData] of Object.entries(this.enhancedTemplate)) {
      const danish = this.danishTranslations[english];
      if (!danish) continue;
      
      const context = templateData.context;
      if (context && context.variables) {
        const issues = this.checkDanishVariableHandling(english, danish, context.variables);
        if (issues.length > 0) {
          variableIssues.push({
            english,
            danish,
            variables: context.variables,
            issues,
            locations: templateData.description
          });
        }
      }
    }
    
    return variableIssues;
  }

  // Check Danish variable handling (agreement, word order, etc.)
  checkDanishVariableHandling(english, danish, variables) {
    const issues = [];
    
    // Check for number-noun agreement issues
    for (const [varName, varInfo] of Object.entries(variables)) {
      if (varInfo.type === 'number') {
        if (!this.hasProperDanishNumberAgreement(danish, varName)) {
          issues.push({
            type: 'number_agreement',
            variable: varName,
            message: 'Danish number-noun agreement may need attention (singular/plural forms)',
            severity: 'high'
          });
        }
      }
      
      // Check for proper gender agreement
      if (this.needsDanishGenderAgreement(danish, varName)) {
        issues.push({
          type: 'gender_agreement',
          variable: varName,
          message: 'Variable may need Danish gender agreement consideration',
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
      const danish = this.danishTranslations[english];
      if (!danish) continue;
      
      const context = templateData.context;
      if (context && context.primary_ui_type === 'title') {
        const issues = this.checkDanishTitle(english, danish);
        if (issues.length > 0) {
          titleIssues.push({
            english,
            danish,
            issues,
            locations: templateData.description
          });
        }
      }
    }
    
    return titleIssues;
  }

  // Check Danish title quality
  checkDanishTitle(english, danish) {
    const issues = [];
    
    // Check capitalization (Danish uses sentence case)
    if (this.hasInappropriateDanishCapitalization(danish)) {
      issues.push({
        type: 'capitalization',
        message: 'Danish titles typically use sentence case, not title case',
        severity: 'low'
      });
    }
    
    // Check for appropriate Danish terminology
    if (this.shouldUseNativeDanishTerms(english, danish)) {
      issues.push({
        type: 'terminology',
        message: 'Consider using native Danish terminology instead of anglicisms',
        severity: 'medium'
      });
    }
    
    return issues;
  }

  // Danish-specific helper methods
  hasAppropriateDanishVerb(english, danish) {
    // Check for Danish imperative forms
    const danishImperativePatterns = [
      /^[a-z]+$/,           // Simple imperative
      /^[a-z]+\s+[a-z]+$/,  // Two-word imperative
    ];
    
    const actionWords = ['add', 'save', 'delete', 'create', 'update', 'send', 'cancel'];
    if (actionWords.some(word => english.toLowerCase().includes(word))) {
      return danishImperativePatterns.some(pattern => pattern.test(danish.toLowerCase())) ||
             danish.toLowerCase().match(/^(tilføj|gem|slet|opret|opdater|send|annuller)/);
    }
    
    return true; // Default to OK if not an action word
  }

  hasIncorrectDanishDefiniteArticle(danish) {
    // Check for potential definite article issues
    // Danish definite articles: -en (common gender), -et (neuter), -ene/-ne (plural)
    const definitePatterns = /\b\w+(?:en|et|ene|ne)\b/g;
    const matches = danish.match(definitePatterns);
    
    if (matches) {
      // Very basic check - would need more sophisticated morphological analysis
      return matches.some(match => match.match(/\w{2,}(en|et)$/) && match.length > 8);
    }
    return false;
  }

  shouldUseDanishCompound(english, danish) {
    // Check if English compound could be better expressed as Danish compound
    const englishWords = english.split(' ');
    const danishWords = danish.split(' ');
    
    // If English has 2 words and Danish has 2+ words, suggest compound
    return englishWords.length === 2 && danishWords.length >= 2 && 
           !danish.includes(' og ') && !danish.includes(' eller '); // Not with conjunctions
  }

  hasInconsistentDanishAddress(danish) {
    // Check for mixing formal/informal address
    const formalMarkers = /\b(De|Dem|Deres)\b/;
    const informalMarkers = /\b(du|dig|din|dit|dine)\b/i;
    
    return formalMarkers.test(danish) && informalMarkers.test(danish);
  }

  hasProperDanishNumberAgreement(danish, varName) {
    // Check for potential number agreement issues
    const numberVar = `{${varName}}`;
    if (danish.includes(numberVar)) {
      // Look for patterns that might indicate missing plural handling
      return !danish.match(new RegExp(`${numberVar}\\s+\\w+[^re]$`)); // Very basic check
    }
    return true;
  }

  needsDanishGenderAgreement(danish, varName) {
    const numberVar = `{${varName}}`;
    // Check if variable appears in context that might need gender agreement
    return danish.includes(numberVar) && danish.match(/\s(den|det|denne|dette)\s/);
  }


  hasInappropriateDanishCapitalization(danish) {
    // Check for English-style title case in Danish
    const words = danish.split(' ');
    if (words.length > 1) {
      // Count capitalized words (excluding first word)
      const capitalizedCount = words.slice(1).filter(word => 
        word.length > 2 && word[0] === word[0].toUpperCase()
      ).length;
      return capitalizedCount > 1; // More than 1 capitalized word suggests title case
    }
    return false;
  }

  shouldUseNativeDanishTerms(english, danish) {
    // Check for excessive use of anglicisms where native terms exist
    const anglicisms = ['computer', 'internet', 'email', 'file', 'download'];
    
    return anglicisms.some(anglicism => danish.toLowerCase().includes(anglicism));
  }

  // Generate improvement recommendations
  generateRecommendations() {
    return [
      '• Use Danish sentence case for titles instead of English title case',
      '• Maintain consistency in formal/informal address (De vs du)',
      '• Use Danish imperative verb forms for action buttons',
      '• Pay attention to definite article suffixes (-en, -et, -ene, -ne)',
      '• Consider Danish compound word construction for technical terms',
      '• Ensure proper number-noun agreement for dynamic content',
      '• Include polite language markers in error messages (venligst, tak)',
      '• Check gender agreement with demonstrative pronouns (den/det)',
      '• Prefer native Danish terms over anglicisms where appropriate',
      '• Consider stød (glottal stop) implications in pronunciation-sensitive contexts'
    ];
  }

  // Main analysis function
  analyze() {
    console.log('🔍 Starting Danish translation analysis...\n');
    
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
    
    console.log('\n📊 DANISH TRANSLATION ANALYSIS REPORT');
    console.log('==================================================');
    console.log(`Total improvement opportunities found: ${totalIssues}\n`);
    
    // Button issues
    if (buttonIssues.length > 0) {
      console.log(`🔘 BUTTON TRANSLATION ISSUES (${buttonIssues.length})`);
      console.log('------------------------------');
      buttonIssues.slice(0, 5).forEach((item, index) => {
        console.log(`${index + 1}. "${item.english}" → "${item.danish}"`);
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
        console.log(`${index + 1}. "${item.english}" → "${item.danish}"`);
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
        console.log(`${index + 1}. "${item.english}" → "${item.danish}"`);
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
    console.log('1. Focus on definite article suffix usage (-en, -et, -ene, -ne)');
    console.log('2. Review formal/informal address consistency (De vs du)');
    console.log('4. Standardize title capitalization to Danish conventions');
    console.log('5. Consider compound word construction for technical terms');
  }
}

// Run the analysis
if (require.main === module) {
  const analyzer = new DanishTranslationAnalyzer();
  analyzer.analyze();
}

module.exports = DanishTranslationAnalyzer;