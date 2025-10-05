'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Dutch Translation Quality Analysis
 * 
 * Analyzes Dutch translations against enhanced context to identify improvement opportunities
 * Focuses on Dutch language-specific grammar, style, and cultural adaptation
 */

class DutchTranslationAnalyzer {
  constructor() {
    this.enhancedTemplate = {};
    this.dutchTranslations = {};
    this.issues = [];
    this.recommendations = [];
  }

  // Load enhanced template and Dutch translations
  loadData() {
    try {
      const rootDir = path.join(__dirname, '../../');
      const enhancedContent = fs.readFileSync(path.join(rootDir, 'template.json'), 'utf8');
      this.enhancedTemplate = JSON.parse(enhancedContent);
      
      const dutchContent = fs.readFileSync(path.join(rootDir, 'locales/nl.json'), 'utf8');
      this.dutchTranslations = JSON.parse(dutchContent);
      
      console.log(`📚 Loaded ${Object.keys(this.enhancedTemplate).length} enhanced template entries`);
      console.log(`🇳🇱 Loaded ${Object.keys(this.dutchTranslations).length} Dutch translations`);
    } catch (error) {
      console.error(`Error loading data: ${error.message}`);
      process.exit(1);
    }
  }

  // Check if Dutch translation follows button text conventions
  analyzeButtonTranslations() {
    const buttonIssues = [];
    
    for (const [english, templateData] of Object.entries(this.enhancedTemplate)) {
      const dutch = this.dutchTranslations[english];
      if (!dutch) continue;
      
      const context = templateData.context;
      if (context && context.primary_ui_type && context.primary_ui_type.includes('button')) {
        const issues = this.checkButtonTextQuality(english, dutch, context);
        if (issues.length > 0) {
          buttonIssues.push({
            english,
            dutch,
            context: context.primary_ui_type,
            issues,
            locations: templateData.description
          });
        }
      }
    }
    
    return buttonIssues;
  }

  // Check button text quality for Dutch
  checkButtonTextQuality(english, dutch, context) {
    const issues = [];
    
    // Check length - Dutch can be longer than English
    if (dutch.length > english.length * 2.5) {
      issues.push({
        type: 'length_concern',
        message: `Dutch text significantly longer than English (${dutch.length} vs ${english.length} chars)`,
        severity: 'medium'
      });
    }
    
    // Check for appropriate verb forms in action buttons (Dutch imperative)
    if (context.primary_ui_type === 'submit_button' || context.primary_ui_type === 'action_button') {
      if (!this.hasAppropriateDutchVerb(english, dutch)) {
        issues.push({
          type: 'verb_form',
          message: 'Consider using Dutch imperative verb form for action buttons',
          severity: 'low'
        });
      }
    }
    
    // Check for formal/informal address consistency (u/je/jij)
    if (this.hasInconsistentDutchAddress(dutch)) {
      issues.push({
        type: 'address_consistency',
        message: 'Check formal/informal address consistency (u/je/jij)',
        severity: 'medium'
      });
    }
    
    // Check for compound word appropriateness
    if (this.shouldUseDutchCompound(english, dutch)) {
      issues.push({
        type: 'compound_word',
        message: 'Consider Dutch compound word construction for better readability',
        severity: 'low'
      });
    }
    
    // Check for modal particle usage
    if (this.needsDutchModalParticles(english, dutch)) {
      issues.push({
        type: 'modal_particles',
        message: 'Consider Dutch modal particles (maar, eens, even, toch) for natural flow',
        severity: 'low'
      });
    }
    
    return issues;
  }

  // Check variable handling in Dutch translations
  analyzeVariableHandling() {
    const variableIssues = [];
    
    for (const [english, templateData] of Object.entries(this.enhancedTemplate)) {
      const dutch = this.dutchTranslations[english];
      if (!dutch) continue;
      
      const context = templateData.context;
      if (context && context.variables) {
        const issues = this.checkDutchVariableHandling(english, dutch, context.variables);
        if (issues.length > 0) {
          variableIssues.push({
            english,
            dutch,
            variables: context.variables,
            issues,
            locations: templateData.description
          });
        }
      }
    }
    
    return variableIssues;
  }

  // Check Dutch variable handling (word order, agreement, etc.)
  checkDutchVariableHandling(english, dutch, variables) {
    const issues = [];
    
    // Check for number-noun agreement issues
    for (const [varName, varInfo] of Object.entries(variables)) {
      if (varInfo.type === 'number') {
        if (!this.hasProperDutchNumberAgreement(dutch, varName)) {
          issues.push({
            type: 'number_agreement',
            variable: varName,
            message: 'Dutch number-noun agreement may need attention (singular/plural forms)',
            severity: 'high'
          });
        }
      }
      
      // Check for proper verb position (V2 rule)
      if (this.violatesDutchV2Rule(dutch, varName)) {
        issues.push({
          type: 'verb_position',
          variable: varName,
          message: 'Variable placement may violate Dutch V2 rule (verb second position)',
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
      const dutch = this.dutchTranslations[english];
      if (!dutch) continue;
      
      const context = templateData.context;
      if (context && context.primary_ui_type === 'title') {
        const issues = this.checkDutchTitle(english, dutch);
        if (issues.length > 0) {
          titleIssues.push({
            english,
            dutch,
            issues,
            locations: templateData.description
          });
        }
      }
    }
    
    return titleIssues;
  }

  // Check Dutch title quality
  checkDutchTitle(english, dutch) {
    const issues = [];
    
    // Check capitalization (Dutch uses sentence case)
    if (this.hasInappropriateDutchCapitalization(dutch)) {
      issues.push({
        type: 'capitalization',
        message: 'Dutch titles typically use sentence case, not title case',
        severity: 'low'
      });
    }
    
    // Check for appropriate Dutch terminology
    if (this.shouldUseNativeDutchTerms(english, dutch)) {
      issues.push({
        type: 'terminology',
        message: 'Consider using native Dutch terminology instead of anglicisms',
        severity: 'medium'
      });
    }
    
    return issues;
  }

  // Dutch-specific helper methods
  hasAppropriateDutchVerb(english, dutch) {
    // Check for Dutch imperative forms
    const dutchImperativePatterns = [
      /^[a-z]+$/,           // Simple imperative (ga, kom, doe)
      /^[a-z]+\s+[a-z]+$/,  // Two-word imperative
    ];
    
    const actionWords = ['add', 'save', 'delete', 'create', 'update', 'send', 'cancel'];
    if (actionWords.some(word => english.toLowerCase().includes(word))) {
      return dutchImperativePatterns.some(pattern => pattern.test(dutch.toLowerCase())) ||
             dutch.toLowerCase().match(/^(voeg|bewaar|verwijder|maak|update|verstuur|annuleer)/);
    }
    
    return true; // Default to OK if not an action word
  }

  hasInconsistentDutchAddress(dutch) {
    // Check for mixing formal/informal address
    const formalMarkers = /\b(u|uw|uzelf)\b/i;
    const informalMarkers = /\b(je|jij|jouw|jezelf)\b/i;
    
    return formalMarkers.test(dutch) && informalMarkers.test(dutch);
  }

  shouldUseDutchCompound(english, dutch) {
    // Check if English compound could be better expressed as Dutch compound
    const englishWords = english.split(' ');
    const dutchWords = dutch.split(' ');
    
    // If English has 2 words and Dutch has 2+ words, suggest compound
    return englishWords.length === 2 && dutchWords.length >= 2 && 
           !dutch.includes(' en ') && !dutch.includes(' of '); // Not with conjunctions
  }

  needsDutchModalParticles(english, dutch) {
    // Check if Dutch could benefit from modal particles for natural flow
    const requestWords = ['please', 'could', 'would', 'try'];
    if (requestWords.some(word => english.toLowerCase().includes(word))) {
      const modalParticles = ['maar', 'eens', 'even', 'toch'];
      return !modalParticles.some(particle => dutch.toLowerCase().includes(particle));
    }
    return false;
  }

  hasProperDutchNumberAgreement(dutch, varName) {
    // Check for potential number agreement issues
    const numberVar = `{${varName}}`;
    if (dutch.includes(numberVar)) {
      // Look for patterns that might indicate missing plural handling
      return !dutch.match(new RegExp(`${numberVar}\\s+\\w+[^s]$`)); // Very basic check
    }
    return true;
  }

  violatesDutchV2Rule(dutch, varName) {
    const numberVar = `{${varName}}`;
    // Basic check for V2 rule violations with variables
    if (dutch.includes(numberVar)) {
      // Check if variable placement might affect verb position
      const parts = dutch.split(numberVar);
      if (parts.length === 2) {
        const beforeVar = parts[0].trim();
        const afterVar = parts[1].trim();
        // Very simplified check - real implementation would need syntactic analysis
        return beforeVar.split(' ').length > 2 && !afterVar.match(/^(is|zijn|heeft|hebben|kan|moet)/);
      }
    }
    return false;
  }


  hasInappropriateDutchCapitalization(dutch) {
    // Check for English-style title case in Dutch
    const words = dutch.split(' ');
    if (words.length > 1) {
      // Count capitalized words (excluding first word)
      const capitalizedCount = words.slice(1).filter(word => 
        word.length > 2 && word[0] === word[0].toUpperCase()
      ).length;
      return capitalizedCount > 1; // More than 1 capitalized word suggests title case
    }
    return false;
  }

  shouldUseNativeDutchTerms(english, dutch) {
    // Check for excessive use of anglicisms where native terms exist
    const anglicisms = ['computer', 'internet', 'email', 'file', 'directory'];
    
    return anglicisms.some(anglicism => dutch.toLowerCase().includes(anglicism));
  }

  // Generate improvement recommendations
  generateRecommendations() {
    return [
      '• Use Dutch sentence case for titles instead of English title case',
      '• Maintain consistency in formal/informal address (u vs je/jij)',
      '• Use Dutch imperative verb forms for action buttons',
      '• Consider Dutch compound word construction for technical terms',
      '• Include modal particles (maar, eens, even, toch) for natural flow',
      '• Ensure proper verb position following Dutch V2 rule',
      '• Include polite language markers in error messages (alstublieft, gelieve)',
      '• Ensure proper number-noun agreement for dynamic content',
      '• Prefer native Dutch terms over anglicisms where appropriate',
      '• Check diminutive forms (-je, -tje, -etje) for appropriate contexts'
    ];
  }

  // Main analysis function
  analyze() {
    console.log('🔍 Starting Dutch translation analysis...\n');
    
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
    
    console.log('\n📊 DUTCH TRANSLATION ANALYSIS REPORT');
    console.log('==================================================');
    console.log(`Total improvement opportunities found: ${totalIssues}\n`);
    
    // Button issues
    if (buttonIssues.length > 0) {
      console.log(`🔘 BUTTON TRANSLATION ISSUES (${buttonIssues.length})`);
      console.log('------------------------------');
      buttonIssues.slice(0, 5).forEach((item, index) => {
        console.log(`${index + 1}. "${item.english}" → "${item.dutch}"`);
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
        console.log(`${index + 1}. "${item.english}" → "${item.dutch}"`);
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
        console.log(`${index + 1}. "${item.english}" → "${item.dutch}"`);
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
    console.log('1. Focus on formal/informal address consistency (u vs je/jij)');
    console.log('2. Review verb position and Dutch V2 rule compliance');
    console.log('4. Standardize title capitalization to Dutch conventions');
    console.log('5. Consider modal particles for more natural Dutch flow');
  }
}

// Run the analysis
if (require.main === module) {
  const analyzer = new DutchTranslationAnalyzer();
  analyzer.analyze();
}

module.exports = DutchTranslationAnalyzer;