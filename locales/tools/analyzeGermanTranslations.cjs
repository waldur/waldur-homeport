'use strict';

const fs = require('fs');
const path = require('path');

/**
 * German Translation Quality Analysis
 * 
 * Analyzes German translations against enhanced context to identify improvement opportunities
 * Focuses on German language-specific grammar, style, and cultural adaptation
 */

class GermanTranslationAnalyzer {
  constructor() {
    this.enhancedTemplate = {};
    this.germanTranslations = {};
    this.issues = [];
    this.recommendations = [];
  }

  // Load enhanced template and German translations
  loadData() {
    try {
      const rootDir = path.join(__dirname, '../../');
      const enhancedContent = fs.readFileSync(path.join(rootDir, 'template.json'), 'utf8');
      this.enhancedTemplate = JSON.parse(enhancedContent);
      
      const germanContent = fs.readFileSync(path.join(rootDir, 'locales/de.json'), 'utf8');
      this.germanTranslations = JSON.parse(germanContent);
      
      console.log(`📚 Loaded ${Object.keys(this.enhancedTemplate).length} enhanced template entries`);
      console.log(`🇩🇪 Loaded ${Object.keys(this.germanTranslations).length} German translations`);
    } catch (error) {
      console.error(`Error loading data: ${error.message}`);
      process.exit(1);
    }
  }

  // Check if German translation follows button text conventions
  analyzeButtonTranslations() {
    const buttonIssues = [];
    
    for (const [english, templateData] of Object.entries(this.enhancedTemplate)) {
      const german = this.germanTranslations[english];
      if (!german) continue;
      
      const context = templateData.context;
      if (context && context.primary_ui_type && context.primary_ui_type.includes('button')) {
        const issues = this.checkButtonTextQuality(english, german, context);
        if (issues.length > 0) {
          buttonIssues.push({
            english,
            german,
            context: context.primary_ui_type,
            issues,
            locations: templateData.description
          });
        }
      }
    }
    
    return buttonIssues;
  }

  // Check button text quality for German
  checkButtonTextQuality(english, german, context) {
    const issues = [];
    
    // Check length - German tends to be longer than English
    if (german.length > english.length * 2.5) {
      issues.push({
        type: 'length_concern',
        message: `German text significantly longer than English (${german.length} vs ${english.length} chars)`,
        severity: 'medium'
      });
    }
    
    // Check for appropriate verb forms in action buttons (German imperative)
    if (context.primary_ui_type === 'submit_button' || context.primary_ui_type === 'action_button') {
      if (!this.hasAppropriateGermanVerb(english, german)) {
        issues.push({
          type: 'verb_form',
          message: 'Consider using German imperative verb form for action buttons',
          severity: 'low'
        });
      }
    }
    
    // Check for formal/informal address consistency
    if (this.hasInconsistentGermanFormality(german)) {
      issues.push({
        type: 'formality_consistency',
        message: 'Check Sie/du consistency - use formal "Sie" in professional contexts',
        severity: 'high'
      });
    }
    
    // Check noun capitalization
    if (!this.hasProperGermanCapitalization(german)) {
      issues.push({
        type: 'capitalization',
        message: 'All German nouns should be capitalized',
        severity: 'medium'
      });
    }
    
    // Check for compound word opportunities
    if (this.shouldUseGermanCompound(english, german)) {
      issues.push({
        type: 'compound_word',
        message: 'Consider German compound word construction for better readability',
        severity: 'low'
      });
    }
    
    // Check for proper Umlaut usage
    if (this.hasMissingUmlauts(german)) {
      issues.push({
        type: 'umlaut_usage',
        message: 'Check for missing or incorrect Umlaut usage (ä, ö, ü)',
        severity: 'medium'
      });
    }
    
    return issues;
  }

  // Check variable handling in German translations
  analyzeVariableHandling() {
    const variableIssues = [];
    
    for (const [english, templateData] of Object.entries(this.enhancedTemplate)) {
      const german = this.germanTranslations[english];
      if (!german) continue;
      
      const context = templateData.context;
      if (context && context.variables) {
        const issues = this.checkGermanVariableHandling(english, german, context.variables);
        if (issues.length > 0) {
          variableIssues.push({
            english,
            german,
            variables: context.variables,
            issues,
            locations: templateData.description
          });
        }
      }
    }
    
    return variableIssues;
  }

  // Check German variable handling (cases, agreement, etc.)
  checkGermanVariableHandling(english, german, variables) {
    const issues = [];
    
    // Check for case agreement issues (German has 4 cases)
    for (const [varName, varInfo] of Object.entries(variables)) {
      if (varInfo.type === 'number') {
        if (!this.hasProperGermanNumberAgreement(german, varName)) {
          issues.push({
            type: 'number_agreement',
            variable: varName,
            message: 'German number-noun agreement may need attention (singular/plural forms)',
            severity: 'high'
          });
        }
      }
      
      // Check for proper case usage with variables (nominative, accusative, dative, genitive)
      if (varInfo.type === 'string' && this.needsGermanCaseAdjustment(german, varName)) {
        issues.push({
          type: 'case_adjustment',
          variable: varName,
          message: 'Variable may need German case inflection (nom/acc/dat/gen)',
          severity: 'high'
        });
      }
    }
    
    return issues;
  }

  // Analyze titles and headings
  analyzeTitleTranslations() {
    const titleIssues = [];
    
    for (const [english, templateData] of Object.entries(this.enhancedTemplate)) {
      const german = this.germanTranslations[english];
      if (!german) continue;
      
      const context = templateData.context;
      if (context && context.primary_ui_type === 'title') {
        const issues = this.checkGermanTitle(english, german);
        if (issues.length > 0) {
          titleIssues.push({
            english,
            german,
            issues,
            locations: templateData.description
          });
        }
      }
    }
    
    return titleIssues;
  }

  // Check German title quality
  checkGermanTitle(english, german) {
    const issues = [];
    
    // Check noun capitalization in titles
    if (!this.hasProperGermanTitleCapitalization(german)) {
      issues.push({
        type: 'capitalization',
        message: 'All German nouns in titles must be capitalized',
        severity: 'high'
      });
    }
    
    // Check for compound word usage in titles
    if (this.shouldUseGermanTitleCompound(english, german)) {
      issues.push({
        type: 'compound_terminology',
        message: 'Consider German compound words for technical titles',
        severity: 'medium'
      });
    }
    
    return issues;
  }

  // German-specific helper methods
  hasAppropriateGermanVerb(english, german) {
    // Check for German imperative forms
    const germanImperativePatterns = [
      /en$/, /e$/, /t$/,  // Common imperative endings
      /ieren$/, /ern$/,   // Common verb endings
    ];
    
    const actionWords = ['add', 'save', 'delete', 'create', 'update', 'send', 'cancel'];
    if (actionWords.some(word => english.toLowerCase().includes(word))) {
      // Check for infinitive forms (often used in buttons)
      return german.includes('hinzufügen') || german.includes('speichern') || 
             german.includes('löschen') || german.includes('erstellen') ||
             germanImperativePatterns.some(pattern => pattern.test(german.toLowerCase()));
    }
    
    return true; // Default to OK if not an action word
  }

  hasInconsistentGermanFormality(german) {
    // Check for mixed Sie/du usage
    const formalPatterns = ['Sie', 'Ihnen', 'Ihr'];
    const informalPatterns = ['du', 'dir', 'dein'];
    
    const hasFormal = formalPatterns.some(pattern => german.includes(pattern));
    const hasInformal = informalPatterns.some(pattern => german.includes(pattern));
    
    return hasFormal && hasInformal; // Mixed usage is inconsistent
  }

  hasProperGermanCapitalization(german) {
    // Check if nouns are properly capitalized
    const words = german.split(/[\s\-/]+/);
    
    // Common German nouns that should be capitalized
    const commonNouns = ['benutzer', 'datei', 'ordner', 'konto', 'einstellung', 'nachricht'];
    
    for (const word of words) {
      const lowerWord = word.toLowerCase();
      if (commonNouns.includes(lowerWord) && word[0] !== word[0].toUpperCase()) {
        return false;
      }
    }
    return true;
  }

  shouldUseGermanCompound(english, german) {
    // Check if English compound could be better expressed as German compound
    const englishWords = english.split(' ');
    const germanWords = german.split(' ');
    
    // If English has 2+ words and German has similar count, suggest compound
    if (englishWords.length >= 2 && germanWords.length >= 2) {
      // Check for common technical terms that should be compounds
      const techTerms = ['user account', 'file system', 'data base', 'network connection'];
      return techTerms.some(term => english.toLowerCase().includes(term.replace(' ', '')));
    }
    return false;
  }

  hasMissingUmlauts(german) {
    // Check for words that might need umlauts
    const umlautWords = {
      'uber': 'über',
      'fur': 'für',
      'grosse': 'große',
      'mussen': 'müssen',
      'konnen': 'können',
      'hoher': 'höher'
    };
    
    for (const [wrong, correct] of Object.entries(umlautWords)) {
      if (german.toLowerCase().includes(wrong) && !german.includes(correct)) {
        return true;
      }
    }
    return false;
  }

  hasProperGermanNumberAgreement(german, varName) {
    const numberVar = `{${varName}}`;
    if (german.includes(numberVar)) {
      // Look for patterns that might indicate missing plural handling
      // German plurals often end in -e, -en, -er, -s
      const context = german.substring(german.indexOf(numberVar));
      return context.match(/\{[^}]+\}\s+\w+(e|en|er|s)\b/) !== null;
    }
    return true;
  }

  needsGermanCaseAdjustment(german, varName) {
    const numberVar = `{${varName}}`;
    // Check if variable appears in context that needs specific case
    return german.includes(numberVar) && 
           german.match(/\s(von|mit|zu|in|an|auf|für|durch|ohne|um)\s/);
  }

  hasAppropriateGermanFormality(german) {
    // Check for formal language markers (Sie form)
    const formalMarkers = ['Sie', 'Ihnen', 'Ihr', 'bitte'];
    return formalMarkers.some(marker => german.includes(marker));
  }

  isGermanErrorTooAbrupt(german) {
    // Check if error message is too abrupt
    const abruptPatterns = ['fehler', 'nicht möglich', 'verboten', 'ungültig'];
    return abruptPatterns.some(pattern => 
      german.toLowerCase().includes(pattern) && 
      !german.includes('bitte') && !german.includes('leider')
    );
  }

  hasProperGermanVerbPosition(german) {
    // Basic check for V2 rule (verb second position in main clauses)
    const sentences = german.split(/[.!?]/);
    for (const sentence of sentences) {
      const words = sentence.trim().split(/\s+/);
      if (words.length >= 3) {
        // Very basic check - in German main clauses, finite verb should be second
        // This is simplified - real implementation would need more sophisticated parsing
      }
    }
    return true; // Default to OK for this simplified check
  }

  hasProperGermanTitleCapitalization(german) {
    // In German titles, all nouns should be capitalized
    const words = german.split(/[\s\-/]+/);
    
    // Articles and prepositions that should not be capitalized (unless first word)
    const lowercaseWords = ['der', 'die', 'das', 'ein', 'eine', 'und', 'oder', 'von', 'mit', 'zu'];
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      if (i > 0 && lowercaseWords.includes(word.toLowerCase()) && word[0] === word[0].toUpperCase()) {
        return false; // Articles shouldn't be capitalized in middle of title
      }
    }
    return true;
  }

  shouldUseGermanTitleCompound(english, german) {
    // Check for technical terms that should be German compounds in titles
    const technicalTerms = ['user interface', 'data management', 'file upload', 'account settings'];
    return technicalTerms.some(term => 
      english.toLowerCase().includes(term.replace(' ', '')) &&
      german.split(' ').length > 1
    );
  }

  // Generate improvement recommendations
  generateRecommendations() {
    return [
      '• Use formal "Sie" form consistently in professional contexts',
      '• Capitalize all German nouns properly',
      '• Prefer German compound words for technical terms',
      '• Use correct German case inflection (Nom/Akk/Dat/Gen)',
      '• Include polite language markers in error messages (bitte, leider)',
      '• Follow German verb position rules (V2 in main clauses)',
      '• Ensure proper Umlaut usage (ä, ö, ü)',
      '• Use German imperative forms for action buttons',
      '• Maintain consistent formality level throughout interface',
      '• Replace Anglicisms with native German terms where appropriate'
    ];
  }

  // Main analysis function
  analyze() {
    console.log('🔍 Starting German translation analysis...\n');
    
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
    
    console.log('\n📊 GERMAN TRANSLATION ANALYSIS REPORT');
    console.log('==================================================');
    console.log(`Total improvement opportunities found: ${totalIssues}\n`);
    
    // Button issues
    if (buttonIssues.length > 0) {
      console.log(`🔘 BUTTON TRANSLATION ISSUES (${buttonIssues.length})`);
      console.log('------------------------------');
      buttonIssues.slice(0, 5).forEach((item, index) => {
        console.log(`${index + 1}. "${item.english}" → "${item.german}"`);
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
        console.log(`${index + 1}. "${item.english}" → "${item.german}"`);
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
        console.log(`${index + 1}. "${item.english}" → "${item.german}"`);
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
    console.log('1. Ensure consistent use of formal "Sie" form throughout');
    console.log('2. Fix noun capitalization and Umlaut usage');
    console.log('3. Review case inflection for variables and context');
    console.log('5. Use German compound words for technical terminology');
  }
}

// Run the analysis
if (require.main === module) {
  const analyzer = new GermanTranslationAnalyzer();
  analyzer.analyze();
}

module.exports = GermanTranslationAnalyzer;