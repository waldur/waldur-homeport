'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Greek Translation Quality Analysis
 * 
 * Analyzes Greek translations against enhanced context to identify improvement opportunities
 * Focuses on Greek language-specific grammar, style, and cultural adaptation
 */

class GreekTranslationAnalyzer {
  constructor() {
    this.enhancedTemplate = {};
    this.greekTranslations = {};
    this.issues = [];
    this.recommendations = [];
  }

  // Load enhanced template and Greek translations
  loadData() {
    try {
      const rootDir = path.join(__dirname, '../../');
      const enhancedContent = fs.readFileSync(path.join(rootDir, 'template.json'), 'utf8');
      this.enhancedTemplate = JSON.parse(enhancedContent);
      
      const greekContent = fs.readFileSync(path.join(rootDir, 'locales/el.json'), 'utf8');
      this.greekTranslations = JSON.parse(greekContent);
      
      console.log(`📚 Loaded ${Object.keys(this.enhancedTemplate).length} enhanced template entries`);
      console.log(`🇬🇷 Loaded ${Object.keys(this.greekTranslations).length} Greek translations`);
    } catch (error) {
      console.error(`Error loading data: ${error.message}`);
      process.exit(1);
    }
  }

  // Check if Greek translation follows button text conventions
  analyzeButtonTranslations() {
    const buttonIssues = [];
    
    for (const [english, templateData] of Object.entries(this.enhancedTemplate)) {
      const greek = this.greekTranslations[english];
      if (!greek) continue;
      
      const context = templateData.context;
      if (context && context.primary_ui_type && context.primary_ui_type.includes('button')) {
        const issues = this.checkButtonTextQuality(english, greek, context);
        if (issues.length > 0) {
          buttonIssues.push({
            english,
            greek,
            context: context.primary_ui_type,
            issues,
            locations: templateData.description
          });
        }
      }
    }
    
    return buttonIssues;
  }

  // Check button text quality for Greek
  checkButtonTextQuality(english, greek, context) {
    const issues = [];
    
    // Check length - Greek tends to be longer than English
    if (greek.length > english.length * 2.5) {
      issues.push({
        type: 'length_concern',
        message: `Greek text significantly longer than English (${greek.length} vs ${english.length} chars)`,
        severity: 'medium'
      });
    }
    
    // Check for appropriate verb forms in action buttons (Greek imperative)
    if (context.primary_ui_type === 'submit_button' || context.primary_ui_type === 'action_button') {
      if (!this.hasAppropriateGreekVerb(english, greek)) {
        issues.push({
          type: 'verb_form',
          message: 'Consider using Greek imperative verb form for action buttons',
          severity: 'low'
        });
      }
    }
    
    // Check for case usage (4 cases: nominative, genitive, accusative, vocative)
    if (this.hasInconsistentGreekCase(greek)) {
      issues.push({
        type: 'case_consistency',
        message: 'Check Greek case usage (4 cases) - ensure consistency with context',
        severity: 'high'
      });
    }
    
    // Check for gender agreement (masculine, feminine, neuter)
    if (this.hasInconsistentGreekGender(greek)) {
      issues.push({
        type: 'gender_agreement',
        message: 'Check Greek gender agreement (masculine, feminine, neuter)',
        severity: 'medium'
      });
    }
    
    // Check for definite article agreement (ο, η, το and their forms)
    if (this.hasIncorrectDefiniteArticle(greek)) {
      issues.push({
        type: 'definite_article',
        message: 'Check Greek definite article agreement (ο, η, το and their forms)',
        severity: 'medium'
      });
    }
    
    // Check for formal/informal address consistency
    if (this.hasInconsistentFormality(greek)) {
      issues.push({
        type: 'formality',
        message: 'Check formal/informal address consistency (εσείς/εσύ)',
        severity: 'high'
      });
    }
    
    // Check for proper accent marks (monotonic system)
    if (this.hasMissingAccents(greek)) {
      issues.push({
        type: 'accent_marks',
        message: 'Ensure proper Greek accent marks (οξεία ´) in monotonic system',
        severity: 'medium'
      });
    }
    
    // Check for proper Greek alphabet usage
    if (this.hasImproperGreekAlphabet(greek)) {
      issues.push({
        type: 'alphabet_usage',
        message: 'Ensure proper Greek alphabet usage, avoid Latin characters',
        severity: 'high'
      });
    }
    
    return issues;
  }

  // Check variable handling in Greek translations
  analyzeVariableHandling() {
    const variableIssues = [];
    
    for (const [english, templateData] of Object.entries(this.enhancedTemplate)) {
      const greek = this.greekTranslations[english];
      if (!greek) continue;
      
      const context = templateData.context;
      if (context && context.variables) {
        const issues = this.checkGreekVariableHandling(english, greek, context.variables);
        if (issues.length > 0) {
          variableIssues.push({
            english,
            greek,
            variables: context.variables,
            issues,
            locations: templateData.description
          });
        }
      }
    }
    
    return variableIssues;
  }

  // Check Greek variable handling (cases, agreement, etc.)
  checkGreekVariableHandling(english, greek, variables) {
    const issues = [];
    
    // Check for number-noun agreement issues
    for (const [varName, varInfo] of Object.entries(variables)) {
      if (varInfo.type === 'number') {
        if (!this.hasProperGreekNumberAgreement(greek, varName)) {
          issues.push({
            type: 'number_agreement',
            variable: varName,
            message: 'Greek number-noun agreement needs attention (singular/plural forms)',
            severity: 'high'
          });
        }
      }
      
      // Check for proper case usage with variables
      if (varInfo.type === 'string' && this.needsGreekCaseAdjustment(greek, varName)) {
        issues.push({
          type: 'case_adjustment',
          variable: varName,
          message: 'Variable may need Greek case inflection in context',
          severity: 'high'
        });
      }
      
      // Check for verb conjugation consistency
      if (this.needsVerbConjugationConsistency(greek, varName)) {
        issues.push({
          type: 'verb_conjugation',
          variable: varName,
          message: 'Check Greek verb conjugations and tenses consistency',
          severity: 'medium'
        });
      }
      
      // Check for definite article agreement with variables
      if (this.needsDefiniteArticleAgreement(greek, varName)) {
        issues.push({
          type: 'article_agreement',
          variable: varName,
          message: 'Variable may need definite article agreement in context',
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
      const greek = this.greekTranslations[english];
      if (!greek) continue;
      
      const context = templateData.context;
      if (context && context.primary_ui_type === 'title') {
        const issues = this.checkGreekTitle(english, greek);
        if (issues.length > 0) {
          titleIssues.push({
            english,
            greek,
            issues,
            locations: templateData.description
          });
        }
      }
    }
    
    return titleIssues;
  }

  // Check Greek title quality
  checkGreekTitle(english, greek) {
    const issues = [];
    
    // Check capitalization (Greek uses sentence case)
    if (this.hasInappropriateGreekCapitalization(greek)) {
      issues.push({
        type: 'capitalization',
        message: 'Greek titles typically use sentence case, not title case',
        severity: 'low'
      });
    }
    
    // Check for appropriate Greek terminology
    if (this.shouldUseNativeGreekTerms(english, greek)) {
      issues.push({
        type: 'terminology',
        message: 'Consider using native Greek terminology instead of loanwords',
        severity: 'medium'
      });
    }
    
    // Check for proper article usage in titles
    if (this.needsArticleInTitle(greek)) {
      issues.push({
        type: 'article_in_title',
        message: 'Consider if Greek definite article is needed in title context',
        severity: 'low'
      });
    }
    
    return issues;
  }

  // Greek-specific helper methods
  hasAppropriateGreekVerb(english, greek) {
    // Check for Greek imperative forms
    const greekImperativePatterns = [
      /[εη]$/, /[ετε]ετε$/, /[στε]στε$/ // Common imperative endings
    ];
    
    const actionWords = ['add', 'save', 'delete', 'create', 'update', 'send', 'cancel'];
    if (actionWords.some(word => english.toLowerCase().includes(word))) {
      return greekImperativePatterns.some(pattern => pattern.test(greek.toLowerCase()));
    }
    
    return true; // Default to OK if not an action word
  }

  hasInconsistentGreekCase(greek) {
    // Check for potential case inconsistencies
    // Look for prepositions that require specific cases
    const casePatterns = [
      /\s(με|από|για|προς)\s.*ος$/i, // These prepositions with nominative (should be accusative)
      /\s(του|της|των)\s.*[^ου|ης|ων]$/i // Genitive articles with wrong endings
    ];
    
    return casePatterns.some(pattern => pattern.test(greek));
  }

  hasInconsistentGreekGender(greek) {
    // Check for potential gender agreement issues
    // Look for article-noun mismatches (simplified check)
    return greek.match(/\sο\s.*[αη]$/) || // masculine article with feminine ending
           greek.match(/\sη\s.*[οςμ]$/) || // feminine article with masculine ending
           greek.match(/\sτο\s.*[αεηου]$/); // neuter article with non-neuter ending
  }

  hasIncorrectDefiniteArticle(greek) {
    // Check for definite article agreement issues
    const articleMismatches = [
      /\sο\s[ΑΕΙΟΥΗΩ]/i, // masculine article with vowel-starting feminine word
      /\sη\s[^ΑΕΙΟΥΗΩ]/i, // feminine article with consonant-starting word that should be masculine
      /\sτο\s.*[ος|η]$/i // neuter article with clearly gendered ending
    ];
    
    return articleMismatches.some(pattern => pattern.test(greek));
  }

  hasInconsistentFormality(greek) {
    // Check for mixing formal and informal address
    return greek.includes('εσείς') && greek.includes('εσύ') ||
           greek.includes('σας') && greek.includes('σου');
  }

  hasMissingAccents(greek) {
    // Check for missing accent marks in words that should have them
    // This is simplified - real implementation would need comprehensive word list
    const wordsNeedingAccents = ['λογαριασμος', 'χρηστης', 'συστημα', 'πραξη'];
    return wordsNeedingAccents.some(word => 
      greek.toLowerCase().includes(word) && 
      !greek.includes(word.replace('ο', 'ό').replace('η', 'ή').replace('α', 'ά'))
    );
  }

  hasImproperGreekAlphabet(greek) {
    // Check for Latin characters or improper Greek usage
    return /[a-zA-Z]/.test(greek) || // Latin characters
           greek.includes('ς') && !greek.match(/ς\s|ς$|ς\.|ς,|ς;/); // Final sigma in wrong position
  }

  hasProperGreekNumberAgreement(greek, varName) {
    // Check for Greek number agreement
    const numberVar = `{${varName}}`;
    if (greek.includes(numberVar)) {
      // Look for patterns that might indicate proper plural handling
      return greek.includes('|') || // Indicates plural handling
             greek.match(/\{.*\}\s+[α-ωά-ώ]+[ες|α|ων]$/); // Plural endings
    }
    return true;
  }

  needsGreekCaseAdjustment(greek, varName) {
    const numberVar = `{${varName}}`;
    // Check if variable appears in context that requires specific case
    return greek.includes(numberVar) && 
           greek.match(/\s(με|από|για|προς|σε|στον|στη|στο)\s/);
  }

  needsVerbConjugationConsistency(greek, varName) {
    // Check for verb conjugation consistency in context
    return greek.includes(`{${varName}}`) && 
           (greek.includes('θα') || greek.includes('έχει') || greek.includes('είναι'));
  }

  needsDefiniteArticleAgreement(greek, varName) {
    // Check if variable needs definite article agreement
    return greek.includes(`{${varName}}`) && 
           greek.match(/\s(ο|η|το|οι|τα)\s/);
  }

  isGreekErrorTooAbrupt(greek) {
    // Check if error message is too abrupt
    const abruptPatterns = ['σφάλμα', 'αδύνατο', 'απαγορευμένο', 'μη έγκυρο'];
    // Check for polite language markers
    return abruptPatterns.some(pattern => {
      return greek.toLowerCase().startsWith(pattern) && !greek.includes('παρακαλώ');
    });
  }

  hasImproperTenseInError(greek) {
    // Check for inappropriate tense in error messages
    return greek.includes('έκανες') || greek.includes('κάνεις'); // Too informal/accusatory
  }

  hasInappropriateGreekCapitalization(greek) {
    // Check for English-style title case in Greek
    const words = greek.split(' ');
    if (words.length > 1) {
      // Count capitalized words (excluding first word)
      const capitalizedCount = words.slice(1).filter(word => 
        word.length > 2 && word[0] === word[0].toUpperCase()
      ).length;
      return capitalizedCount > 1; // More than 1 capitalized word suggests title case
    }
    return false;
  }

  shouldUseNativeGreekTerms(english, greek) {
    // Check for excessive use of loanwords where native terms exist
    const loanwords = ['κομπιούτερ', 'ίντερνετ', 'εμαίλ', 'φάιλ'];
    
    return loanwords.some(loanword => greek.toLowerCase().includes(loanword));
  }

  needsArticleInTitle(greek) {
    // Check if title might benefit from definite article
    return greek.split(' ').length > 1 && 
           !greek.match(/^(ο|η|το|οι|τα)\s/) && 
           !greek.includes('νέ'); // Not starting with article and not "new"
  }

  // Generate improvement recommendations
  generateRecommendations() {
    return [
      '• Use Greek sentence case for titles instead of English title case',
      '• Ensure proper case usage (4 cases: nominative, genitive, accusative, vocative)',
      '• Pay attention to gender agreement (masculine, feminine, neuter)',
      '• Use correct definite article forms (ο, η, το and their declensions)',
      '• Maintain consistent formal/informal address (εσείς/εσύ)',
      '• Ensure proper accent marks in monotonic system (οξεία ´)',
      '• Use proper Greek alphabet, avoid Latin characters',
      '• Check verb conjugations and tenses for consistency',
      '• Implement proper number agreement for dynamic content',
      '• Include polite language markers (παρακαλώ, συγγνώμη)',
      '• Use Greek imperative forms for action buttons',
      '• Consider definite article usage in titles where appropriate',
      '• Adapt technical terminology to native Greek terms'
    ];
  }

  // Main analysis function
  analyze() {
    console.log('🔍 Starting Greek translation analysis...\n');
    
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
    
    console.log('\n📊 GREEK TRANSLATION ANALYSIS REPORT');
    console.log('==================================================');
    console.log(`Total improvement opportunities found: ${totalIssues}\n`);
    
    // Button issues
    if (buttonIssues.length > 0) {
      console.log(`🔘 BUTTON TRANSLATION ISSUES (${buttonIssues.length})`);
      console.log('------------------------------');
      buttonIssues.slice(0, 5).forEach((item, index) => {
        console.log(`${index + 1}. "${item.english}" → "${item.greek}"`);
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
        console.log(`${index + 1}. "${item.english}" → "${item.greek}"`);
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
        console.log(`${index + 1}. "${item.english}" → "${item.greek}"`);
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
    console.log('1. Focus on case system implementation (4 cases) and article agreement');
    console.log('2. Ensure proper accent marks in monotonic system');
    console.log('3. Review gender agreement throughout all translations');
    console.log('4. Standardize formal/informal address (εσείς/εσύ)');
    console.log('5. Check verb conjugations and tenses for consistency');
  }
}

// Run the analysis
if (require.main === module) {
  const analyzer = new GreekTranslationAnalyzer();
  analyzer.analyze();
}

module.exports = GreekTranslationAnalyzer;