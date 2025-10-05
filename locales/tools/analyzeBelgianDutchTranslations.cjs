'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Belgian Dutch Translation Quality Analysis
 * 
 * Analyzes Belgian Dutch translations against enhanced context to identify improvement opportunities
 * Focuses on Belgian Dutch language-specific grammar, style, and cultural adaptation
 */

class BelgianDutchTranslationAnalyzer {
  constructor() {
    this.enhancedTemplate = {};
    this.belgianDutchTranslations = {};
    this.issues = [];
    this.recommendations = [];
  }

  // Load enhanced template and Belgian Dutch translations
  loadData() {
    try {
      const rootDir = path.join(__dirname, '../../');
      const enhancedContent = fs.readFileSync(path.join(rootDir, 'template.json'), 'utf8');
      this.enhancedTemplate = JSON.parse(enhancedContent);
      
      const belgianDutchContent = fs.readFileSync(path.join(rootDir, 'locales/nl-BE.json'), 'utf8');
      this.belgianDutchTranslations = JSON.parse(belgianDutchContent);
      
      console.log(`📚 Loaded ${Object.keys(this.enhancedTemplate).length} enhanced template entries`);
      console.log(`🇧🇪 Loaded ${Object.keys(this.belgianDutchTranslations).length} Belgian Dutch translations`);
    } catch (error) {
      console.error(`Error loading data: ${error.message}`);
      process.exit(1);
    }
  }

  // Check if Belgian Dutch translation follows button text conventions
  analyzeButtonTranslations() {
    const buttonIssues = [];
    
    for (const [english, templateData] of Object.entries(this.enhancedTemplate)) {
      const belgianDutch = this.belgianDutchTranslations[english];
      if (!belgianDutch) continue;
      
      const context = templateData.context;
      if (context && context.primary_ui_type && context.primary_ui_type.includes('button')) {
        const issues = this.checkButtonTextQuality(english, belgianDutch, context);
        if (issues.length > 0) {
          buttonIssues.push({
            english,
            belgianDutch,
            context: context.primary_ui_type,
            issues,
            locations: templateData.description
          });
        }
      }
    }
    
    return buttonIssues;
  }

  // Check button text quality for Belgian Dutch
  checkButtonTextQuality(english, belgianDutch, context) {
    const issues = [];
    
    // Check length - Belgian Dutch can be longer than English
    if (belgianDutch.length > english.length * 2.5) {
      issues.push({
        type: 'length_concern',
        message: `Belgian Dutch text significantly longer than English (${belgianDutch.length} vs ${english.length} chars)`,
        severity: 'medium'
      });
    }
    
    // Check for appropriate verb forms in action buttons (Belgian Dutch imperative)
    if (context.primary_ui_type === 'submit_button' || context.primary_ui_type === 'action_button') {
      if (!this.hasAppropriateBelgianDutchVerb(english, belgianDutch)) {
        issues.push({
          type: 'verb_form',
          message: 'Consider using Belgian Dutch imperative verb form for action buttons',
          severity: 'low'
        });
      }
    }
    
    // Check for formal address preferences (Belgian Dutch tends to be more formal)
    if (this.lacksBelgianFormalAddress(belgianDutch)) {
      issues.push({
        type: 'formality_level',
        message: 'Belgian Dutch typically prefers more formal address forms',
        severity: 'medium'
      });
    }
    
    // Check for Belgian-specific vocabulary
    if (this.shouldUseBelgianSpecificTerms(english, belgianDutch)) {
      issues.push({
        type: 'belgian_vocabulary',
        message: 'Consider using Belgian-specific vocabulary variants',
        severity: 'low'
      });
    }
    
    // Check for French loanword usage (more common in Belgium)
    if (this.shouldUseFrenchLoanwords(english, belgianDutch)) {
      issues.push({
        type: 'french_loanwords',
        message: 'Consider Belgian Dutch French loanwords where appropriate',
        severity: 'low'
      });
    }
    
    return issues;
  }

  // Check variable handling in Belgian Dutch translations
  analyzeVariableHandling() {
    const variableIssues = [];
    
    for (const [english, templateData] of Object.entries(this.enhancedTemplate)) {
      const belgianDutch = this.belgianDutchTranslations[english];
      if (!belgianDutch) continue;
      
      const context = templateData.context;
      if (context && context.variables) {
        const issues = this.checkBelgianDutchVariableHandling(english, belgianDutch, context.variables);
        if (issues.length > 0) {
          variableIssues.push({
            english,
            belgianDutch,
            variables: context.variables,
            issues,
            locations: templateData.description
          });
        }
      }
    }
    
    return variableIssues;
  }

  // Check Belgian Dutch variable handling (word order, agreement, etc.)
  checkBelgianDutchVariableHandling(english, belgianDutch, variables) {
    const issues = [];
    
    // Check for number-noun agreement issues
    for (const [varName, varInfo] of Object.entries(variables)) {
      if (varInfo.type === 'number') {
        if (!this.hasProperBelgianDutchNumberAgreement(belgianDutch, varName)) {
          issues.push({
            type: 'number_agreement',
            variable: varName,
            message: 'Belgian Dutch number-noun agreement may need attention',
            severity: 'high'
          });
        }
      }
      
      // Check for proper verb position (V2 rule with Belgian variations)
      if (this.violatesBelgianDutchV2Rule(belgianDutch, varName)) {
        issues.push({
          type: 'verb_position',
          variable: varName,
          message: 'Variable placement may violate Belgian Dutch V2 rule variations',
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
      const belgianDutch = this.belgianDutchTranslations[english];
      if (!belgianDutch) continue;
      
      const context = templateData.context;
      if (context && context.primary_ui_type === 'title') {
        const issues = this.checkBelgianDutchTitle(english, belgianDutch);
        if (issues.length > 0) {
          titleIssues.push({
            english,
            belgianDutch,
            issues,
            locations: templateData.description
          });
        }
      }
    }
    
    return titleIssues;
  }

  // Check Belgian Dutch title quality
  checkBelgianDutchTitle(english, belgianDutch) {
    const issues = [];
    
    // Check capitalization (Belgian Dutch uses sentence case)
    if (this.hasInappropriateBelgianDutchCapitalization(belgianDutch)) {
      issues.push({
        type: 'capitalization',
        message: 'Belgian Dutch titles typically use sentence case, not title case',
        severity: 'low'
      });
    }
    
    // Check for appropriate Belgian Dutch terminology
    if (this.shouldUseNativeBelgianDutchTerms(english, belgianDutch)) {
      issues.push({
        type: 'terminology',
        message: 'Consider using Belgian Dutch terminology variants',
        severity: 'medium'
      });
    }
    
    return issues;
  }

  // Belgian Dutch-specific helper methods
  hasAppropriateBelgianDutchVerb(english, belgianDutch) {
    // Check for Belgian Dutch imperative forms (similar to Dutch but with local variations)
    const belgianDutchImperativePatterns = [
      /^[a-z]+$/,           // Simple imperative
      /^[a-z]+\s+[a-z]+$/,  // Two-word imperative
    ];
    
    const actionWords = ['add', 'save', 'delete', 'create', 'update', 'send', 'cancel'];
    if (actionWords.some(word => english.toLowerCase().includes(word))) {
      return belgianDutchImperativePatterns.some(pattern => pattern.test(belgianDutch.toLowerCase())) ||
             belgianDutch.toLowerCase().match(/^(voeg|bewaar|verwijder|maak|update|verstuur|annuleer)/);
    }
    
    return true; // Default to OK if not an action word
  }

  lacksBelgianFormalAddress(belgianDutch) {
    // Belgian Dutch tends to be more formal, check for informal markers
    const informalMarkers = /\b(je|jij|jouw|jezelf)\b/i;
    const formalMarkers = /\b(u|uw|uzelf)\b/i;
    
    // Flag if using informal when formal might be more appropriate
    return informalMarkers.test(belgianDutch) && !formalMarkers.test(belgianDutch);
  }

  shouldUseBelgianSpecificTerms(english, belgianDutch) {
    // Check for opportunities to use Belgian-specific vocabulary
    const belgianVariants = {
      'zeventig': 'septante',     // 70 (sometimes used in Belgium)
      'negentig': 'nonante',      // 90 (sometimes used in Belgium)
      'gsm': 'mobiele telefoon',  // mobile phone
      'kot': 'kamer',             // room (student room)
    };
    
    return Object.keys(belgianVariants).some(term => 
      belgianDutch.toLowerCase().includes(term)
    );
  }

  shouldUseFrenchLoanwords(english, belgianDutch) {
    // Belgian Dutch commonly uses French loanwords
    const frenchLoanwordOpportunities = {
      'computer': 'ordinateur',
      'parking': 'parkeerplaats',
      'weekend': 'weekend',
      'shopping': 'winkelen',
    };
    
    return Object.keys(frenchLoanwordOpportunities).some(term => 
      english.toLowerCase().includes(term) && !belgianDutch.toLowerCase().includes(term)
    );
  }

  hasProperBelgianDutchNumberAgreement(belgianDutch, varName) {
    // Check for potential number agreement issues (similar to Dutch)
    const numberVar = `{${varName}}`;
    if (belgianDutch.includes(numberVar)) {
      // Look for patterns that might indicate missing plural handling
      return !belgianDutch.match(new RegExp(`${numberVar}\\s+\\w+[^s]$`)); // Very basic check
    }
    return true;
  }

  violatesBelgianDutchV2Rule(belgianDutch, varName) {
    const numberVar = `{${varName}}`;
    // Basic check for V2 rule violations with variables (similar to Dutch)
    if (belgianDutch.includes(numberVar)) {
      // Check if variable placement might affect verb position
      const parts = belgianDutch.split(numberVar);
      if (parts.length === 2) {
        const beforeVar = parts[0].trim();
        const afterVar = parts[1].trim();
        // Very simplified check
        return beforeVar.split(' ').length > 2 && !afterVar.match(/^(is|zijn|heeft|hebben|kan|moet)/);
      }
    }
    return false;
  }


  hasInappropriateBelgianDutchCapitalization(belgianDutch) {
    // Check for English-style title case in Belgian Dutch
    const words = belgianDutch.split(' ');
    if (words.length > 1) {
      // Count capitalized words (excluding first word)
      const capitalizedCount = words.slice(1).filter(word => 
        word.length > 2 && word[0] === word[0].toUpperCase()
      ).length;
      return capitalizedCount > 1; // More than 1 capitalized word suggests title case
    }
    return false;
  }

  shouldUseNativeBelgianDutchTerms(english, belgianDutch) {
    // Check for opportunities to use Belgian Dutch variants
    const standardDutchTerms = ['alstublieft', 'negentig', 'zeventig', 'kamer', 'koelkast'];
    
    return standardDutchTerms.some(term => belgianDutch.toLowerCase().includes(term));
  }

  // Generate improvement recommendations
  generateRecommendations() {
    return [
      '• Use more formal address forms typical of Belgian Dutch (u instead of je/jij)',
      '• Consider Belgian-specific vocabulary variants where appropriate',
      '• Include French loanwords common in Belgian Dutch',
      '• Use sentence case for titles instead of title case',
      '• Consider regional number variations (septante, nonante)',
      '• Maintain proper verb position following Dutch V2 rule',
      '• Include appropriate formal language markers in error messages',
      '• Ensure proper number-noun agreement for dynamic content',
      '• Use Belgian Dutch compound word construction patterns'
    ];
  }

  // Main analysis function
  analyze() {
    console.log('🔍 Starting Belgian Dutch translation analysis...\n');
    
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
    
    console.log('\n📊 BELGIAN DUTCH TRANSLATION ANALYSIS REPORT');
    console.log('==================================================');
    console.log(`Total improvement opportunities found: ${totalIssues}\n`);
    
    // Button issues
    if (buttonIssues.length > 0) {
      console.log(`🔘 BUTTON TRANSLATION ISSUES (${buttonIssues.length})`);
      console.log('------------------------------');
      buttonIssues.slice(0, 5).forEach((item, index) => {
        console.log(`${index + 1}. "${item.english}" → "${item.belgianDutch}"`);
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
        console.log(`${index + 1}. "${item.english}" → "${item.belgianDutch}"`);
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
        console.log(`${index + 1}. "${item.english}" → "${item.belgianDutch}"`);
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
    console.log('1. Focus on formal address consistency (u vs je/jij)');
    console.log('2. Consider Belgian-specific vocabulary and French loanwords');
    console.log('3. Enhance formality level in error messages');
    console.log('4. Standardize title capitalization to Belgian Dutch conventions');
    console.log('5. Review number variations and regional preferences');
  }
}

// Run the analysis
if (require.main === module) {
  const analyzer = new BelgianDutchTranslationAnalyzer();
  analyzer.analyze();
}

module.exports = BelgianDutchTranslationAnalyzer;