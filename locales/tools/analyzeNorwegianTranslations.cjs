'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Norwegian Translation Quality Analysis
 * 
 * Analyzes Norwegian translations against enhanced context to identify improvement opportunities
 * Focuses on Norwegian language-specific grammar, style, and cultural adaptation
 */

class NorwegianTranslationAnalyzer {
  constructor() {
    this.enhancedTemplate = {};
    this.norwegianTranslations = {};
    this.issues = [];
    this.recommendations = [];
  }

  // Load enhanced template and Norwegian translations
  loadData() {
    try {
      const rootDir = path.join(__dirname, '../../');
      const enhancedContent = fs.readFileSync(path.join(rootDir, 'template.json'), 'utf8');
      this.enhancedTemplate = JSON.parse(enhancedContent);
      
      const norwegianContent = fs.readFileSync(path.join(rootDir, 'locales/nb.json'), 'utf8');
      this.norwegianTranslations = JSON.parse(norwegianContent);
      
      console.log(`📚 Loaded ${Object.keys(this.enhancedTemplate).length} enhanced template entries`);
      console.log(`🇳🇴 Loaded ${Object.keys(this.norwegianTranslations).length} Norwegian translations`);
    } catch (error) {
      console.error(`Error loading data: ${error.message}`);
      process.exit(1);
    }
  }

  // Check if Norwegian translation follows button text conventions
  analyzeButtonTranslations() {
    const buttonIssues = [];
    
    for (const [english, templateData] of Object.entries(this.enhancedTemplate)) {
      const norwegian = this.norwegianTranslations[english];
      if (!norwegian) continue;
      
      const context = templateData.context;
      if (context && context.primary_ui_type && context.primary_ui_type.includes('button')) {
        const issues = this.checkButtonTextQuality(english, norwegian, context);
        if (issues.length > 0) {
          buttonIssues.push({
            english,
            norwegian,
            context: context.primary_ui_type,
            issues,
            locations: templateData.description
          });
        }
      }
    }
    
    return buttonIssues;
  }

  // Check button text quality for Norwegian
  checkButtonTextQuality(english, norwegian, context) {
    const issues = [];
    
    // Check length - Norwegian is typically longer than English
    if (norwegian.length > english.length * 3) {
      issues.push({
        type: 'length_concern',
        message: `Norwegian text significantly longer than English (${norwegian.length} vs ${english.length} chars)`,
        severity: 'medium'
      });
    }
    
    // Check for appropriate verb forms in action buttons (Norwegian imperative)
    if (context.primary_ui_type === 'submit_button' || context.primary_ui_type === 'action_button') {
      if (!this.hasAppropriateNorwegianVerb(english, norwegian)) {
        issues.push({
          type: 'verb_form',
          message: 'Consider using Norwegian imperative verb form for action buttons',
          severity: 'low'
        });
      }
    }
    
    // Check for compound word appropriateness (Norwegian loves compound words)
    if (this.shouldUseNorwegianCompound(english, norwegian)) {
      issues.push({
        type: 'compound_word',
        message: 'Consider Norwegian compound word construction for better readability',
        severity: 'low'
      });
    }
    
    // Check for English loanwords where Norwegian equivalents exist
    if (this.hasUnnecessaryEnglishLoanwords(norwegian)) {
      issues.push({
        type: 'loanword_usage',
        message: 'Consider using native Norwegian terms instead of English loanwords',
        severity: 'medium'
      });
    }
    
    return issues;
  }

  // Check variable handling in Norwegian translations
  analyzeVariableHandling() {
    const variableIssues = [];
    
    for (const [english, templateData] of Object.entries(this.enhancedTemplate)) {
      const norwegian = this.norwegianTranslations[english];
      if (!norwegian) continue;
      
      const context = templateData.context;
      if (context && context.variables) {
        const issues = this.checkNorwegianVariableHandling(english, norwegian, context.variables);
        if (issues.length > 0) {
          variableIssues.push({
            english,
            norwegian,
            variables: context.variables,
            issues,
            locations: templateData.description
          });
        }
      }
    }
    
    return variableIssues;
  }

  // Check Norwegian variable handling (gender agreement, plurals, etc.)
  checkNorwegianVariableHandling(english, norwegian, variables) {
    const issues = [];
    
    // Check for number-noun agreement issues (Norwegian has simpler plural rules than Estonian)
    for (const [varName, varInfo] of Object.entries(variables)) {
      if (varInfo.type === 'number') {
        if (!this.hasProperNorwegianNumberAgreement(norwegian, varName)) {
          issues.push({
            type: 'number_agreement',
            message: 'Norwegian number-noun agreement may need attention (singular/plural forms)',
            severity: 'high'
          });
        }
      }
      
      // Check for gender agreement with Norwegian nouns
      if (varInfo.type === 'string' && this.needsNorwegianGenderAgreement(norwegian, varName)) {
        issues.push({
          type: 'gender_agreement',
          variable: varName,
          message: 'Variable may need Norwegian gender agreement (en/ei/et)',
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
      const norwegian = this.norwegianTranslations[english];
      if (!norwegian) continue;
      
      const context = templateData.context;
      if (context && context.primary_ui_type === 'title') {
        const issues = this.checkNorwegianTitle(english, norwegian);
        if (issues.length > 0) {
          titleIssues.push({
            english,
            norwegian,
            issues,
            locations: templateData.description
          });
        }
      }
    }
    
    return titleIssues;
  }

  // Check Norwegian title quality
  checkNorwegianTitle(english, norwegian) {
    const issues = [];
    
    // Check capitalization (Norwegian uses sentence case like other Scandinavian languages)
    if (this.hasInappropriateNorwegianCapitalization(norwegian)) {
      issues.push({
        type: 'capitalization',
        message: 'Norwegian titles typically use sentence case, not title case',
        severity: 'low'
      });
    }
    
    // Check for appropriate Norwegian terminology
    if (this.shouldUseNativeNorwegianTerms(english, norwegian)) {
      issues.push({
        type: 'terminology',
        message: 'Consider using native Norwegian terminology instead of loanwords',
        severity: 'medium'
      });
    }
    
    return issues;
  }

  // Norwegian-specific helper methods
  hasAppropriateNorwegianVerb(english, norwegian) {
    // Common English action verbs and their appropriate Norwegian imperative forms
    const verbMappings = {
      'save': ['lagre', 'lagr'],
      'delete': ['slett', 'slette'],
      'edit': ['rediger', 'redigere', 'endre'],
      'create': ['opprett', 'lag', 'skape'],
      'add': ['legg til', 'tilføy'],
      'remove': ['fjern', 'ta bort'],
      'cancel': ['avbryt', 'kanseller'],
      'submit': ['send inn', 'bekreft'],
      'confirm': ['bekreft'],
      'reload': ['last inn på nytt', 'oppdater'],
      'refresh': ['oppdater', 'oppfrisk'],
      'update': ['oppdater'],
      'upload': ['last opp'],
      'download': ['last ned']
    };
    
    const englishLower = english.toLowerCase();
    const norwegianLower = norwegian.toLowerCase();
    
    for (const [engVerb, norForms] of Object.entries(verbMappings)) {
      if (englishLower.includes(engVerb)) {
        return norForms.some(form => norwegianLower.includes(form));
      }
    }
    
    return true; // Default to OK if not detected
  }

  shouldUseNorwegianCompound(english, norwegian) {
    // Norwegian loves compound words - check if English compound could be better as Norwegian compound
    const englishWords = english.split(' ');
    const norwegianWords = norwegian.split(' ');
    
    // If English has 2+ words and Norwegian has same or more, suggest compound
    return englishWords.length >= 2 && norwegianWords.length >= englishWords.length && 
           !norwegian.includes(' og ') && !norwegian.includes(' eller '); // Not with conjunctions
  }

  hasUnnecessaryEnglishLoanwords(norwegian) {
    // Check for excessive use of English loanwords where native Norwegian terms exist
    const commonLoanwords = ['email', 'mail', 'download', 'upload', 'update', 'computer', 'file', 'folder'];
    
    return commonLoanwords.some(loanword => norwegian.toLowerCase().includes(loanword));
  }

  hasProperNorwegianNumberAgreement(norwegian, varName) {
    // Check for potential number agreement issues (Norwegian is simpler than German/Estonian)
    const numberVar = `{${varName}}`;
    if (norwegian.includes(numberVar)) {
      // Look for patterns that might indicate missing plural handling
      // Norwegian typically adds -er, -e, or has irregular plurals
      return !norwegian.match(new RegExp(`${numberVar}\\s+\\w+(?!er|e)$`)); // Very basic check
    }
    return true;
  }

  needsNorwegianGenderAgreement(norwegian, varName) {
    const numberVar = `{${varName}}`;
    // Check if variable appears in context that might need gender agreement
    // Norwegian has three genders: en (masculine), ei (feminine), et (neuter)
    return norwegian.includes(numberVar) && norwegian.match(/\s(en|ei|et)\s/);
  }

  hasInappropriateNorwegianCapitalization(norwegian) {
    // Check for English-style title case in Norwegian
    const words = norwegian.split(' ');
    if (words.length > 1) {
      // Count capitalized words (excluding first word)
      const capitalizedCount = words.slice(1).filter(word => 
        word.length > 2 && word[0] === word[0].toUpperCase()
      ).length;
      return capitalizedCount > 1; // More than 1 capitalized word suggests title case
    }
    return false;
  }

  shouldUseNativeNorwegianTerms(english, norwegian) {
    // Check for excessive use of loanwords where native terms exist
    const loanwordPatterns = ['computer', 'email', 'file', 'folder', 'update', 'download'];
    return loanwordPatterns.some(pattern => norwegian.toLowerCase().includes(pattern));
  }

  // Generate improvement recommendations specific to Norwegian
  generateNorwegianRecommendations() {
    return [
      '• Use Norwegian sentence case for titles instead of English title case',
      '• Prefer native Norwegian terms over English loanwords when available',
      '• Use Norwegian imperative forms for action buttons (lagre, slett, rediger)',
      '• Consider Norwegian compound word construction for technical terms',
      '• Include friendly language markers in error messages (vennligst, beklager)',
      '• Ensure proper number-noun agreement for dynamic content',
      '• Use appropriate Norwegian gender agreement (en/ei/et)',
      '• Adapt technical terminology to Norwegian language patterns',
      '• Keep error messages user-friendly rather than overly technical'
    ];
  }

  // Main analysis function
  analyze() {
    console.log('🔍 Starting Norwegian translation analysis...\n');
    
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
    
    console.log('\n📊 NORWEGIAN TRANSLATION ANALYSIS REPORT');
    console.log('==================================================');
    console.log(`Total improvement opportunities found: ${totalIssues}\n`);
    
    // Button issues
    if (buttonIssues.length > 0) {
      console.log(`🔘 BUTTON TRANSLATION ISSUES (${buttonIssues.length})`);
      console.log('------------------------------');
      buttonIssues.slice(0, 5).forEach((item, index) => {
        console.log(`${index + 1}. "${item.english}" → "${item.norwegian}"`);
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
        console.log(`${index + 1}. "${item.english}" → "${item.norwegian}"`);
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
        console.log(`${index + 1}. "${item.english}" → "${item.norwegian}"`);
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
    this.generateNorwegianRecommendations().forEach(rec => console.log(rec));
    
    console.log('\n🎯 PRIORITY ACTIONS:');
    console.log('1. Focus on variable handling and gender agreement issues first');
    console.log('2. Review button text for Norwegian imperative forms');
    console.log('3. Enhance error message user-friendliness');
    console.log('4. Standardize title capitalization to Norwegian conventions');
    console.log('5. Replace English loanwords with native Norwegian terms where appropriate');
    console.log('6. Consider Norwegian compound word construction for technical terms');
  }
}

// Run the analysis
if (require.main === module) {
  const analyzer = new NorwegianTranslationAnalyzer();
  analyzer.analyze();
}

module.exports = NorwegianTranslationAnalyzer;