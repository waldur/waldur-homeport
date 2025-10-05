'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Italian Translation Quality Analysis
 * 
 * Analyzes Italian translations against enhanced context to identify improvement opportunities
 * Focuses on Italian language-specific grammar, style, and cultural adaptation
 */

class ItalianTranslationAnalyzer {
  constructor() {
    this.enhancedTemplate = {};
    this.italianTranslations = {};
    this.issues = [];
    this.recommendations = [];
  }

  // Load enhanced template and Italian translations
  loadData() {
    try {
      const rootDir = path.join(__dirname, '../../');
      const enhancedContent = fs.readFileSync(path.join(rootDir, 'template.json'), 'utf8');
      this.enhancedTemplate = JSON.parse(enhancedContent);
      
      const italianContent = fs.readFileSync(path.join(rootDir, 'locales/it.json'), 'utf8');
      this.italianTranslations = JSON.parse(italianContent);
      
      console.log(`📚 Loaded ${Object.keys(this.enhancedTemplate).length} enhanced template entries`);
      console.log(`🇮🇹 Loaded ${Object.keys(this.italianTranslations).length} Italian translations`);
    } catch (error) {
      console.error(`Error loading data: ${error.message}`);
      process.exit(1);
    }
  }

  // Check if Italian translation follows button text conventions
  analyzeButtonTranslations() {
    const buttonIssues = [];
    
    for (const [english, templateData] of Object.entries(this.enhancedTemplate)) {
      const italian = this.italianTranslations[english];
      if (!italian) continue;
      
      const context = templateData.context;
      if (context && context.primary_ui_type && context.primary_ui_type.includes('button')) {
        const issues = this.checkButtonTextQuality(english, italian, context);
        if (issues.length > 0) {
          buttonIssues.push({
            english,
            italian,
            context: context.primary_ui_type,
            issues,
            locations: templateData.description
          });
        }
      }
    }
    
    return buttonIssues;
  }

  // Check button text quality for Italian
  checkButtonTextQuality(english, italian, context) {
    const issues = [];
    
    // Check length - Italian tends to be longer than English
    if (italian.length > english.length * 2.4) {
      issues.push({
        type: 'length_concern',
        message: `Italian text significantly longer than English (${italian.length} vs ${english.length} chars)`,
        severity: 'medium'
      });
    }
    
    // Check for appropriate verb forms in action buttons (Italian imperative)
    if (context.primary_ui_type === 'submit_button' || context.primary_ui_type === 'action_button') {
      if (!this.hasAppropriateItalianVerb(english, italian)) {
        issues.push({
          type: 'verb_form',
          message: 'Consider using Italian imperative verb form for action buttons',
          severity: 'low'
        });
      }
    }
    
    // Check for formal/informal address consistency
    if (this.hasInconsistentItalianFormality(italian)) {
      issues.push({
        type: 'formality_consistency',
        message: 'Check Lei/tu consistency - use formal "Lei" in professional contexts',
        severity: 'high'
      });
    }
    
    // Check gender agreement
    if (!this.hasProperItalianGenderAgreement(italian)) {
      issues.push({
        type: 'gender_agreement',
        message: 'Check masculine/feminine gender agreement in Italian',
        severity: 'high'
      });
    }
    
    // Check article usage
    if (!this.hasProperItalianArticles(italian)) {
      issues.push({
        type: 'article_usage',
        message: 'Check Italian article usage (il, la, lo, gli, le)',
        severity: 'medium'
      });
    }
    
    // Check for double consonants
    if (this.hasMissingDoubleConsonants(italian)) {
      issues.push({
        type: 'double_consonants',
        message: 'Check for missing or incorrect double consonants in Italian',
        severity: 'medium'
      });
    }
    
    // Check for proper accent marks on final vowels
    if (this.hasMissingItalianAccents(italian)) {
      issues.push({
        type: 'accent_marks',
        message: 'Check for missing accent marks on final vowels (à, è, ì, ò, ù)',
        severity: 'medium'
      });
    }
    
    return issues;
  }

  // Check variable handling in Italian translations
  analyzeVariableHandling() {
    const variableIssues = [];
    
    for (const [english, templateData] of Object.entries(this.enhancedTemplate)) {
      const italian = this.italianTranslations[english];
      if (!italian) continue;
      
      const context = templateData.context;
      if (context && context.variables) {
        const issues = this.checkItalianVariableHandling(english, italian, context.variables);
        if (issues.length > 0) {
          variableIssues.push({
            english,
            italian,
            variables: context.variables,
            issues,
            locations: templateData.description
          });
        }
      }
    }
    
    return variableIssues;
  }

  // Check Italian variable handling (gender agreement, verb conjugations, etc.)
  checkItalianVariableHandling(english, italian, variables) {
    const issues = [];
    
    // Check for gender agreement with variables
    for (const [varName, varInfo] of Object.entries(variables)) {
      if (varInfo.type === 'number') {
        if (!this.hasProperItalianNumberAgreement(italian, varName)) {
          issues.push({
            type: 'number_agreement',
            variable: varName,
            message: 'Italian number-noun agreement may need attention (singular/plural)',
            severity: 'high'
          });
        }
      }
      
      // Check for gender agreement with string variables
      if (varInfo.type === 'string' && this.needsItalianGenderAgreement(italian, varName)) {
        issues.push({
          type: 'gender_agreement',
          variable: varName,
          message: 'Variable may need Italian gender agreement (masculine/feminine)',
          severity: 'high'
        });
      }
      
      // Check for verb conjugation with person variables
      if (this.needsItalianVerbConjugation(italian, varName)) {
        issues.push({
          type: 'verb_conjugation',
          variable: varName,
          message: 'Consider Italian verb conjugation for person/number agreement',
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
      const italian = this.italianTranslations[english];
      if (!italian) continue;
      
      const context = templateData.context;
      if (context && context.primary_ui_type === 'title') {
        const issues = this.checkItalianTitle(english, italian);
        if (issues.length > 0) {
          titleIssues.push({
            english,
            italian,
            issues,
            locations: templateData.description
          });
        }
      }
    }
    
    return titleIssues;
  }

  // Check Italian title quality
  checkItalianTitle(english, italian) {
    const issues = [];
    
    // Check capitalization (Italian uses sentence case)
    if (this.hasInappropriateItalianCapitalization(italian)) {
      issues.push({
        type: 'capitalization',
        message: 'Italian titles typically use sentence case, not title case',
        severity: 'low'
      });
    }
    
    // Check for appropriate Italian terminology
    if (this.shouldUseNativeItalianTerms(english, italian)) {
      issues.push({
        type: 'terminology',
        message: 'Consider using native Italian terminology instead of Anglicisms',
        severity: 'medium'
      });
    }
    
    return issues;
  }

  // Italian-specific helper methods
  hasAppropriateItalianVerb(english, italian) {
    // Check for Italian imperative forms
    const italianImperativePatterns = [
      /are$/, /ere$/, /ire$/,  // Infinitive endings
      /a$/, /i$/,             // Imperative endings
      /ate$/, /ete$/, /ite$/, // Plural imperative endings
    ];
    
    const actionWords = ['add', 'save', 'delete', 'create', 'update', 'send', 'cancel'];
    if (actionWords.some(word => english.toLowerCase().includes(word))) {
      // Check for common Italian action verbs
      const commonActionVerbs = ['aggiungi', 'salva', 'elimina', 'crea', 'aggiorna', 'invia', 'annulla'];
      return commonActionVerbs.some(verb => italian.toLowerCase().includes(verb)) ||
             italianImperativePatterns.some(pattern => pattern.test(italian.toLowerCase()));
    }
    
    return true;
  }

  hasInconsistentItalianFormality(italian) {
    // Check for mixed Lei/tu usage
    const formalPatterns = ['Lei', 'Suo', 'Sua', 'Suoi', 'Sue'];
    const informalPatterns = ['tu', 'tuo', 'tua', 'tuoi', 'tue'];
    
    const hasFormal = formalPatterns.some(pattern => italian.includes(pattern));
    const hasInformal = informalPatterns.some(pattern => italian.includes(pattern));
    
    return hasFormal && hasInformal;
  }

  hasProperItalianGenderAgreement(italian) {
    // Basic check for gender agreement issues
    
    // Look for obvious gender disagreement patterns
    const mismatchPatterns = [
      /la\s+\w+o$/,        // la + masculine ending
      /il\s+\w+a$/,        // il + feminine ending
      /uno\s+\w+a$/,       // uno + feminine ending
      /una\s+\w+o$/,       // una + masculine ending
    ];
    
    return !mismatchPatterns.some(pattern => pattern.test(italian.toLowerCase()));
  }

  hasProperItalianArticles(italian) {
    // Check for proper article usage
    const articlePatterns = [
      /\bil\s+[aeiou]/i,   // il before vowel (should be l')
      /\bla\s+[aeiou]/i,   // la before vowel (should be l')
      /\blo\s+[bcdfghjklmnpqrstvwxyz]/i, // lo before consonants (check if correct)
    ];
    
    // This is a simplified check - real implementation would be more complex
    return !articlePatterns.some(pattern => pattern.test(italian));
  }

  hasMissingDoubleConsonants(italian) {
    // Check for words that commonly need double consonants
    const doubleConsonantWords = {
      'programmare': /program[^m]/,
      'annullare': /anul[^l]/,
      'collegare': /coleg[^g]/,
      'errore': /eror[^r]/,
      'messaggio': /mesag[^g]/,
      'successo': /suceso[^s]/
    };
    
    for (const [correct, wrongPattern] of Object.entries(doubleConsonantWords)) {
      if (wrongPattern.test(italian.toLowerCase()) && !italian.toLowerCase().includes(correct)) {
        return true;
      }
    }
    return false;
  }

  hasMissingItalianAccents(italian) {
    // Check for words that need accent marks on final vowels
    const accentWords = {
      'piu': 'più',
      'cioe': 'cioè',
      'cosi': 'così',
      'perche': 'perché',
      'caffe': 'caffè',
      'citta': 'città',
      'qualita': 'qualità',
      'attivita': 'attività'
    };
    
    for (const [wrong, correct] of Object.entries(accentWords)) {
      if (italian.toLowerCase().includes(wrong) && !italian.includes(correct)) {
        return true;
      }
    }
    return false;
  }

  hasProperItalianNumberAgreement(italian, varName) {
    const numberVar = `{${varName}}`;
    if (italian.includes(numberVar)) {
      // Look for proper plural agreement patterns
      const pluralContext = italian.substring(italian.indexOf(numberVar));
      return pluralContext.match(/\{[^}]+\}\s+\w+(i|e)\b/) !== null ||
             italian.includes('uno') || italian.includes('una'); // Singular forms
    }
    return true;
  }

  needsItalianGenderAgreement(italian, varName) {
    const numberVar = `{${varName}}`;
    // Check if variable appears in context that needs gender agreement
    return italian.includes(numberVar) && 
           italian.match(/\s(il|la|lo|gli|le|un|una|questo|questa|quello|quella)\s/);
  }

  needsItalianVerbConjugation(italian, varName) {
    // Check for contexts where verb conjugation might be important
    const numberVar = `{${varName}}`;
    if (italian.includes(numberVar)) {
      // Look for verbs that might need conjugation based on the variable
      const verbPatterns = ['è', 'sono', 'ha', 'hanno', 'fa', 'fanno'];
      return verbPatterns.some(verb => italian.includes(verb));
    }
    return false;
  }

  hasAppropriateItalianFormality(italian) {
    // Check for formal language markers (Lei form)
    const formalMarkers = ['Lei', 'Suo', 'Sua', 'per favore', 'prego', 'cortesemente'];
    return formalMarkers.some(marker => italian.includes(marker));
  }

  isItalianErrorTooAbrupt(italian) {
    // Check if error message is too abrupt
    const abruptPatterns = ['errore', 'impossibile', 'vietato', 'non valido'];
    return abruptPatterns.some(pattern => 
      italian.toLowerCase().includes(pattern) && 
      !italian.includes('per favore') && 
      !italian.includes('prego') &&
      !italian.includes('scusi')
    );
  }

  needsItalianSubjunctive(italian) {
    // Check for contexts where subjunctive might be appropriate
    const subjunctiveMarkers = ['che', 'se', 'benché', 'purché', 'affinché'];
    return subjunctiveMarkers.some(marker => italian.includes(marker)) &&
           italian.includes('possibile'); // Common context for subjunctive
  }

  hasInappropriateItalianCapitalization(italian) {
    // Check for English-style title case in Italian
    const words = italian.split(' ');
    if (words.length > 1) {
      // Count capitalized words (excluding first word and proper nouns)
      const capitalizedCount = words.slice(1).filter(word => 
        word.length > 2 && 
        word[0] === word[0].toUpperCase() &&
        !['I', 'II', 'III', 'IV', 'V'].includes(word) && // Roman numerals
        !word.match(/^[A-Z]+$/) // Acronyms are OK
      ).length;
      return capitalizedCount > 1;
    }
    return false;
  }

  shouldUseNativeItalianTerms(english, italian) {
    // Check for excessive use of Anglicisms where native terms exist
    const anglicisms = ['email', 'software', 'hardware', 'login', 'website', 'download'];
    
    return anglicisms.some(anglicism => italian.toLowerCase().includes(anglicism));
  }

  // Generate improvement recommendations
  generateRecommendations() {
    return [
      '• Use formal "Lei" form consistently in professional contexts',
      '• Ensure proper masculine/feminine gender agreement',
      '• Check article usage (il, la, lo, gli, le)',
      '• Verify double consonant usage in Italian words',
      '• Add accent marks on final vowels (à, è, ì, ò, ù)',
      '• Apply proper verb conjugations for person/number',
      '• Use subjunctive mood for hypothetical situations',
      '• Include polite language markers (per favore, prego)',
      '• Use Italian sentence case for titles',
      '• Replace Anglicisms with native Italian terms where appropriate'
    ];
  }

  // Main analysis function
  analyze() {
    console.log('🔍 Starting Italian translation analysis...\n');
    
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
    
    console.log('\n📊 ITALIAN TRANSLATION ANALYSIS REPORT');
    console.log('==================================================');
    console.log(`Total improvement opportunities found: ${totalIssues}\n`);
    
    // Button issues
    if (buttonIssues.length > 0) {
      console.log(`🔘 BUTTON TRANSLATION ISSUES (${buttonIssues.length})`);
      console.log('------------------------------');
      buttonIssues.slice(0, 5).forEach((item, index) => {
        console.log(`${index + 1}. "${item.english}" → "${item.italian}"`);
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
        console.log(`${index + 1}. "${item.english}" → "${item.italian}"`);
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
        console.log(`${index + 1}. "${item.english}" → "${item.italian}"`);
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
    console.log('1. Ensure consistent use of formal "Lei" form throughout');
    console.log('2. Fix gender agreement issues (masculine/feminine)');
    console.log('3. Check article usage and double consonant spelling');
    console.log('4. Add missing accent marks on final vowels');
    console.log('5. Review verb conjugations for proper person/number agreement');
  }
}

// Run the analysis
if (require.main === module) {
  const analyzer = new ItalianTranslationAnalyzer();
  analyzer.analyze();
}

module.exports = ItalianTranslationAnalyzer;