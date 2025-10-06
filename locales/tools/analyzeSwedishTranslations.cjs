'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Swedish Translation Quality Analysis
 *
 * Analyzes Swedish translations against enhanced context to identify improvement opportunities
 * Focuses on Swedish language-specific grammar, style, and cultural adaptation
 */

class SwedishTranslationAnalyzer {
  constructor() {
    this.enhancedTemplate = {};
    this.swedishTranslations = {};
    this.issues = [];
    this.recommendations = [];
  }

  // Load enhanced template and Swedish translations
  loadData() {
    try {
      const rootDir = path.join(__dirname, '../../');
      const enhancedContent = fs.readFileSync(
        path.join(rootDir, 'template.json'),
        'utf8',
      );
      this.enhancedTemplate = JSON.parse(enhancedContent);

      const swedishContent = fs.readFileSync(
        path.join(rootDir, 'locales/sv.json'),
        'utf8',
      );
      this.swedishTranslations = JSON.parse(swedishContent);

      console.log(
        `📚 Loaded ${Object.keys(this.enhancedTemplate).length} enhanced template entries`,
      );
      console.log(
        `🇸🇪 Loaded ${Object.keys(this.swedishTranslations).length} Swedish translations`,
      );
    } catch (error) {
      console.error(`Error loading data: ${error.message}`);
      process.exit(1);
    }
  }

  // Check if Swedish translation follows button text conventions
  analyzeButtonTranslations() {
    const buttonIssues = [];

    for (const [english, templateData] of Object.entries(
      this.enhancedTemplate,
    )) {
      const swedish = this.swedishTranslations[english];
      if (!swedish) continue;

      const context = templateData.context;
      if (
        context &&
        context.primary_ui_type &&
        context.primary_ui_type.includes('button')
      ) {
        const issues = this.checkButtonTextQuality(english, swedish, context);
        if (issues.length > 0) {
          buttonIssues.push({
            english,
            swedish,
            context: context.primary_ui_type,
            issues,
            locations: templateData.description,
          });
        }
      }
    }

    return buttonIssues;
  }

  // Check button text quality for Swedish
  checkButtonTextQuality(english, swedish, context) {
    const issues = [];

    // Check length - Swedish can be longer than English
    if (swedish.length > english.length * 2.5) {
      issues.push({
        type: 'length_concern',
        message: `Swedish text significantly longer than English (${swedish.length} vs ${english.length} chars)`,
        severity: 'medium',
      });
    }

    // Check for appropriate verb forms in action buttons (Swedish imperative)
    if (
      context.primary_ui_type === 'submit_button' ||
      context.primary_ui_type === 'action_button'
    ) {
      if (!this.hasAppropriateSwedishVerb(english, swedish)) {
        issues.push({
          type: 'verb_form',
          message:
            'Consider using Swedish imperative verb form for action buttons',
          severity: 'low',
        });
      }
    }

    // Check for definite article suffix usage (-en, -et, -na, -a)
    if (this.hasIncorrectSwedishDefiniteArticle(swedish)) {
      issues.push({
        type: 'definite_article',
        message:
          'Check Swedish definite article suffix usage (-en, -et, -na, -a)',
        severity: 'medium',
      });
    }

    // Check for compound word appropriateness
    if (this.shouldUseSwedishCompound(english, swedish)) {
      issues.push({
        type: 'compound_word',
        message:
          'Consider Swedish compound word construction for better readability',
        severity: 'low',
      });
    }

    // Check for formal/informal address consistency (ni/du)
    if (this.hasInconsistentSwedishAddress(swedish)) {
      issues.push({
        type: 'address_consistency',
        message: 'Check formal/informal address consistency (ni/du)',
        severity: 'medium',
      });
    }

    return issues;
  }

  // Check variable handling in Swedish translations
  analyzeVariableHandling() {
    const variableIssues = [];

    for (const [english, templateData] of Object.entries(
      this.enhancedTemplate,
    )) {
      const swedish = this.swedishTranslations[english];
      if (!swedish) continue;

      const context = templateData.context;
      if (context && context.variables) {
        const issues = this.checkSwedishVariableHandling(
          english,
          swedish,
          context.variables,
        );
        if (issues.length > 0) {
          variableIssues.push({
            english,
            swedish,
            variables: context.variables,
            issues,
            locations: templateData.description,
          });
        }
      }
    }

    return variableIssues;
  }

  // Check Swedish variable handling (agreement, word order, etc.)
  checkSwedishVariableHandling(english, swedish, variables) {
    const issues = [];

    // Check for number-noun agreement issues
    for (const [varName, varInfo] of Object.entries(variables)) {
      if (varInfo.type === 'number') {
        if (!this.hasProperSwedishNumberAgreement(swedish, varName)) {
          issues.push({
            type: 'number_agreement',
            variable: varName,
            message:
              'Swedish number-noun agreement may need attention (singular/plural forms)',
            severity: 'high',
          });
        }
      }

      // Check for proper gender agreement
      if (this.needsSwedishGenderAgreement(swedish, varName)) {
        issues.push({
          type: 'gender_agreement',
          variable: varName,
          message:
            'Variable may need Swedish gender agreement consideration (en/ett)',
          severity: 'medium',
        });
      }
    }

    return issues;
  }

  // Analyze titles and headings
  analyzeTitleTranslations() {
    const titleIssues = [];

    for (const [english, templateData] of Object.entries(
      this.enhancedTemplate,
    )) {
      const swedish = this.swedishTranslations[english];
      if (!swedish) continue;

      const context = templateData.context;
      if (context && context.primary_ui_type === 'title') {
        const issues = this.checkSwedishTitle(english, swedish);
        if (issues.length > 0) {
          titleIssues.push({
            english,
            swedish,
            issues,
            locations: templateData.description,
          });
        }
      }
    }

    return titleIssues;
  }

  // Check Swedish title quality
  checkSwedishTitle(english, swedish) {
    const issues = [];

    // Check capitalization (Swedish uses sentence case)
    if (this.hasInappropriateSwedishCapitalization(swedish)) {
      issues.push({
        type: 'capitalization',
        message: 'Swedish titles typically use sentence case, not title case',
        severity: 'low',
      });
    }

    // Check for appropriate Swedish terminology
    if (this.shouldUseNativeSwedishTerms(english, swedish)) {
      issues.push({
        type: 'terminology',
        message:
          'Consider using native Swedish terminology instead of anglicisms',
        severity: 'medium',
      });
    }

    return issues;
  }

  // Swedish-specific helper methods
  hasAppropriateSwedishVerb(english, swedish) {
    // Check for Swedish imperative forms
    const swedishImperativePatterns = [
      /^[a-z]+$/, // Simple imperative
      /^[a-z]+\s+[a-z]+$/, // Two-word imperative
    ];

    const actionWords = [
      'add',
      'save',
      'delete',
      'create',
      'update',
      'send',
      'cancel',
    ];
    if (actionWords.some((word) => english.toLowerCase().includes(word))) {
      return (
        swedishImperativePatterns.some((pattern) =>
          pattern.test(swedish.toLowerCase()),
        ) ||
        swedish
          .toLowerCase()
          .match(/^(lägg till|spara|radera|skapa|uppdatera|skicka|avbryt)/)
      );
    }

    return true; // Default to OK if not an action word
  }

  hasIncorrectSwedishDefiniteArticle(swedish) {
    // Check for potential definite article issues
    // Swedish definite articles: -en (common gender), -et (neuter), -na/-a (plural)
    const definitePatterns = /\b\w+(?:en|et|na|a)\b/g;
    const matches = swedish.match(definitePatterns);

    if (matches) {
      // Very basic check - would need more sophisticated morphological analysis
      return matches.some(
        (match) => match.match(/\w{2,}(en|et)$/) && match.length > 8,
      );
    }
    return false;
  }

  shouldUseSwedishCompound(english, swedish) {
    // Check if English compound could be better expressed as Swedish compound
    const englishWords = english.split(' ');
    const swedishWords = swedish.split(' ');

    // If English has 2 words and Swedish has 2+ words, suggest compound
    return (
      englishWords.length === 2 &&
      swedishWords.length >= 2 &&
      !swedish.includes(' och ') &&
      !swedish.includes(' eller ')
    ); // Not with conjunctions
  }

  hasInconsistentSwedishAddress(swedish) {
    // Check for mixing formal/informal address
    const formalMarkers = /\b(ni|er|ert|era)\b/i;
    const informalMarkers = /\b(du|dig|din|ditt|dina)\b/i;

    return formalMarkers.test(swedish) && informalMarkers.test(swedish);
  }

  hasProperSwedishNumberAgreement(swedish, varName) {
    // Check for potential number agreement issues
    const numberVar = `{${varName}}`;
    if (swedish.includes(numberVar)) {
      // Look for patterns that might indicate missing plural handling
      return !swedish.match(new RegExp(`${numberVar}\\s+\\w+[^r]$`)); // Very basic check
    }
    return true;
  }

  needsSwedishGenderAgreement(swedish, varName) {
    const numberVar = `{${varName}}`;
    // Check if variable appears in context that might need gender agreement
    return (
      swedish.includes(numberVar) && swedish.match(/\s(den|det|denna|detta)\s/)
    );
  }

  hasInappropriateSwedishCapitalization(swedish) {
    // Check for English-style title case in Swedish
    const words = swedish.split(' ');
    if (words.length > 1) {
      // Count capitalized words (excluding first word)
      const capitalizedCount = words
        .slice(1)
        .filter(
          (word) => word.length > 2 && word[0] === word[0].toUpperCase(),
        ).length;
      return capitalizedCount > 1; // More than 1 capitalized word suggests title case
    }
    return false;
  }

  shouldUseNativeSwedishTerms(english, swedish) {
    // Check for excessive use of anglicisms where native terms exist
    const anglicisms = ['computer', 'internet', 'email', 'file', 'download'];

    return anglicisms.some((anglicism) =>
      swedish.toLowerCase().includes(anglicism),
    );
  }

  // Generate improvement recommendations
  generateRecommendations() {
    return [
      '• Use Swedish sentence case for titles instead of English title case',
      '• Maintain consistency in formal/informal address (ni vs du)',
      '• Use Swedish imperative verb forms for action buttons',
      '• Pay attention to definite article suffixes (-en, -et, -na, -a)',
      '• Consider Swedish compound word construction for technical terms',
      '• Ensure proper number-noun agreement for dynamic content',
      '• Include polite language markers in error messages (snälla, tack)',
      '• Check gender agreement with demonstrative pronouns (den/det)',
      '• Prefer native Swedish terms over anglicisms where appropriate',
      '• Consider pitch accent implications in pronunciation-sensitive contexts',
    ];
  }

  // Main analysis function
  analyze() {
    console.log('🔍 Starting Swedish translation analysis...\n');

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
    const totalIssues =
      buttonIssues.length + variableIssues.length + titleIssues.length;

    console.log('\n📊 SWEDISH TRANSLATION ANALYSIS REPORT');
    console.log('==================================================');
    console.log(`Total improvement opportunities found: ${totalIssues}\n`);

    // Button issues
    if (buttonIssues.length > 0) {
      console.log(`🔘 BUTTON TRANSLATION ISSUES (${buttonIssues.length})`);
      console.log('------------------------------');
      buttonIssues.slice(0, 5).forEach((item, index) => {
        console.log(`${index + 1}. "${item.english}" → "${item.swedish}"`);
        console.log(`   Context: ${item.context}`);
        item.issues.forEach((issue) => {
          console.log(`   ⚠️  ${issue.message}`);
        });
        console.log('');
      });
      if (buttonIssues.length > 5) {
        console.log(
          `   ... and ${buttonIssues.length - 5} more button issues\n`,
        );
      }
    }

    // Variable issues
    if (variableIssues.length > 0) {
      console.log(`🔢 VARIABLE HANDLING ISSUES (${variableIssues.length})`);
      console.log('------------------------------');
      variableIssues.slice(0, 5).forEach((item, index) => {
        console.log(`${index + 1}. "${item.english}" → "${item.swedish}"`);
        console.log(`   Variables: ${Object.keys(item.variables).join(', ')}`);
        item.issues.forEach((issue) => {
          console.log(`   ⚠️  ${issue.message}`);
        });
        console.log('');
      });
      if (variableIssues.length > 5) {
        console.log(
          `   ... and ${variableIssues.length - 5} more variable issues\n`,
        );
      }
    }

    // Title issues
    if (titleIssues.length > 0) {
      console.log(`📝 TITLE TRANSLATION ISSUES (${titleIssues.length})`);
      console.log('------------------------------');
      titleIssues.slice(0, 5).forEach((item, index) => {
        console.log(`${index + 1}. "${item.english}" → "${item.swedish}"`);
        console.log(`   Context: title`);
        item.issues.forEach((issue) => {
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
    this.generateRecommendations().forEach((rec) => console.log(rec));

    console.log('\n🎯 PRIORITY ACTIONS:');
    console.log(
      '1. Focus on definite article suffix usage (-en, -et, -na, -a)',
    );
    console.log('2. Review formal/informal address consistency (ni vs du)');
    console.log('4. Standardize title capitalization to Swedish conventions');
    console.log('5. Consider gender agreement for en/ett words');
  }
}

// Run the analysis
if (require.main === module) {
  const analyzer = new SwedishTranslationAnalyzer();
  analyzer.analyze();
}

module.exports = SwedishTranslationAnalyzer;
