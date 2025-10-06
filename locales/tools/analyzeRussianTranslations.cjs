'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Russian Translation Quality Analysis
 *
 * Analyzes Russian translations against enhanced context to identify improvement opportunities
 */

class RussianTranslationAnalyzer {
  constructor() {
    this.enhancedTemplate = {};
    this.russianTranslations = {};
    this.issues = [];
    this.recommendations = [];
  }

  // Load enhanced template and Russian translations
  loadData() {
    try {
      const rootDir = path.join(__dirname, '../../');
      const enhancedContent = fs.readFileSync(
        path.join(rootDir, 'template.json'),
        'utf8',
      );
      this.enhancedTemplate = JSON.parse(enhancedContent);

      const russianContent = fs.readFileSync(
        path.join(rootDir, 'locales/ru.json'),
        'utf8',
      );
      this.russianTranslations = JSON.parse(russianContent);

      console.log(
        `📚 Loaded ${Object.keys(this.enhancedTemplate).length} enhanced template entries`,
      );
      console.log(
        `🇷🇺 Loaded ${Object.keys(this.russianTranslations).length} Russian translations`,
      );
    } catch (error) {
      console.error(`Error loading data: ${error.message}`);
      process.exit(1);
    }
  }

  // Check if Russian translation follows button text conventions
  analyzeButtonTranslations() {
    const buttonIssues = [];

    for (const [english, templateData] of Object.entries(
      this.enhancedTemplate,
    )) {
      const russian = this.russianTranslations[english];
      if (!russian) continue;

      const context = templateData.context;
      if (
        context &&
        context.primary_ui_type &&
        context.primary_ui_type.includes('button')
      ) {
        const issues = this.checkButtonTextQuality(english, russian, context);
        if (issues.length > 0) {
          buttonIssues.push({
            english,
            russian,
            context: context.primary_ui_type,
            issues,
            locations: templateData.description,
          });
        }
      }
    }

    return buttonIssues;
  }

  // Check button text quality
  checkButtonTextQuality(english, russian, context) {
    const issues = [];

    // Check length - Russian buttons should be reasonably short
    if (russian.length > english.length * 2.5) {
      issues.push({
        type: 'length_concern',
        message: `Russian text significantly longer than English (${russian.length} vs ${english.length} chars)`,
        severity: 'medium',
      });
    }

    // Check for appropriate verb forms in action buttons
    if (
      context.primary_ui_type === 'submit_button' ||
      context.primary_ui_type === 'action_button'
    ) {
      if (!this.hasAppropriateRussianVerb(english, russian)) {
        issues.push({
          type: 'verb_form',
          message:
            'Consider using imperative verb form for action buttons in Russian',
          severity: 'low',
        });
      }
    }

    // Check delete button appropriateness
    if (context.primary_ui_type === 'delete_button') {
      if (!this.isAppropriateDeleteTranslation(russian)) {
        issues.push({
          type: 'delete_appropriateness',
          message: 'Consider stronger/clearer delete action term in Russian',
          severity: 'medium',
        });
      }
    }

    return issues;
  }

  // Check if Russian uses appropriate verb form
  hasAppropriateRussianVerb(english, russian) {
    // Common English action verbs and their appropriate Russian imperative forms
    const verbMappings = {
      save: ['сохранить', 'сохранитъ', 'сохрани'],
      delete: ['удалить', 'удали', 'удалитъ'],
      edit: ['редактировать', 'изменить', 'правка'],
      create: ['создать', 'создатъ', 'создай'],
      add: ['добавить', 'добавитъ', 'добави'],
      remove: ['убрать', 'удалить', 'убери'],
      cancel: ['отменить', 'отмена', 'отмени'],
      submit: ['отправить', 'подтвердить', 'отправь'],
      confirm: ['подтвердить', 'подтверди'],
      reload: ['перезагрузить', 'перезагрузи', 'обновить'], // NOT 'перезаряжать' (recharge)
      staff: ['персонал', 'сотрудники', 'кадры'], // NOT 'посох' (walking stick)
      refresh: ['обновить', 'освежить', 'обнови'],
      restart: ['перезапустить', 'перезапусти'],
      update: ['обновить', 'обнови', 'обновитъ'],
      upload: ['загрузить', 'загрузи'],
      download: ['скачать', 'загрузить', 'скачай'],
    };

    // Common incorrect verb forms to flag
    const incorrectMappings = {
      reload: ['перезаряжать', 'перезарядить'], // These mean "recharge", not "reload"
      staff: ['посох'], // This means "walking stick", not "staff/personnel"
      load: ['заряжать', 'зарядить'], // These also mean "charge", not "load"
      charge: ['загружать'], // This means "load", not "charge"
    };

    const englishLower = english.toLowerCase();
    const russianLower = russian.toLowerCase();

    // First check for common incorrect forms
    for (const [engVerb, incorrectForms] of Object.entries(incorrectMappings)) {
      if (englishLower.includes(engVerb)) {
        if (incorrectForms.some((form) => russianLower.includes(form))) {
          return false; // Flag as incorrect
        }
      }
    }

    // Then check for correct forms
    for (const [engVerb, rusForms] of Object.entries(verbMappings)) {
      if (englishLower.includes(engVerb)) {
        return rusForms.some((form) => russianLower.includes(form));
      }
    }

    return true; // Assume OK if we can't detect
  }

  // Check if delete translation is appropriately strong
  isAppropriateDeleteTranslation(russian) {
    const strongDeleteTerms = [
      'удалить',
      'удали',
      'удаление',
      'стереть',
      'уничтожить',
    ];

    const russianLower = russian.toLowerCase();
    return strongDeleteTerms.some((term) => russianLower.includes(term));
  }

  // Analyze variable handling in Russian translations
  analyzeVariableTranslations() {
    const variableIssues = [];

    for (const [english, templateData] of Object.entries(
      this.enhancedTemplate,
    )) {
      const russian = this.russianTranslations[english];
      if (!russian) continue;

      const context = templateData.context;
      if (
        context &&
        context.variables &&
        Object.keys(context.variables).length > 0
      ) {
        const issues = this.checkVariableHandling(
          english,
          russian,
          context.variables,
        );
        if (issues.length > 0) {
          variableIssues.push({
            english,
            russian,
            variables: context.variables,
            issues,
            locations: templateData.description,
          });
        }
      }
    }

    return variableIssues;
  }

  // Check variable handling quality
  checkVariableHandling(english, russian, variables) {
    const issues = [];

    // Check if all variables are present in Russian
    for (const varName of Object.keys(variables)) {
      const varPattern = `{${varName}}`;
      if (!russian.includes(varPattern)) {
        issues.push({
          type: 'missing_variable',
          message: `Variable {${varName}} missing in Russian translation`,
          severity: 'high',
        });
      }
    }

    // Check for potential word order issues with numbers
    const numberVars = Object.entries(variables).filter(
      ([_, data]) => data.type === 'number',
    );
    if (numberVars.length > 0) {
      const wordOrderIssue = this.checkRussianNumberWordOrder(
        english,
        russian,
        numberVars,
      );
      if (wordOrderIssue) {
        issues.push(wordOrderIssue);
      }
    }

    return issues;
  }

  // Check Russian number-noun agreement
  checkRussianNumberWordOrder(english, russian, numberVars) {
    // Russian has complex number-noun agreement rules
    // This is a simplified check for potential issues

    for (const [varName] of numberVars) {
      const varPattern = `{${varName}}`;
      const varIndex = russian.indexOf(varPattern);
      if (varIndex === -1) continue;

      // Check if there's a noun after the number that might need agreement
      const textAfterVar = russian
        .substring(varIndex + varPattern.length)
        .trim();
      const words = textAfterVar.split(/\s+/);

      if (words.length > 0 && words[0]) {
        // This is a simplified check - in reality, you'd need more sophisticated Russian grammar analysis
        const firstWord = words[0].toLowerCase();

        // Check for common patterns that might indicate singular form used where plural might be needed
        if (this.isPotentialRussianPluralIssue(firstWord)) {
          return {
            type: 'number_agreement',
            message: `Check Russian number-noun agreement for {${varName}} - may need conditional plural forms`,
            severity: 'medium',
          };
        }
      }
    }

    return null;
  }

  // Simple check for potential Russian plural issues
  isPotentialRussianPluralIssue(word) {
    // Common endings that suggest singular form
    const singularEndings = ['а', 'я', 'ь', 'о', 'е'];
    return singularEndings.some((ending) => word.endsWith(ending));
  }

  // Analyze title translations
  analyzeTitleTranslations() {
    const titleIssues = [];

    for (const [english, templateData] of Object.entries(
      this.enhancedTemplate,
    )) {
      const russian = this.russianTranslations[english];
      if (!russian) continue;

      const context = templateData.context;
      if (
        context &&
        (context.primary_ui_type === 'title' ||
          context.primary_ui_type === 'page_title' ||
          context.primary_ui_type === 'section_title')
      ) {
        const issues = this.checkTitleQuality(english, russian, context);
        if (issues.length > 0) {
          titleIssues.push({
            english,
            russian,
            context: context.primary_ui_type,
            issues,
            locations: templateData.description,
          });
        }
      }
    }

    return titleIssues;
  }

  // Check title translation quality
  checkTitleQuality(english, russian) {
    const issues = [];

    // Check capitalization appropriateness for Russian
    if (this.hasInappropriateRussianCapitalization(english, russian)) {
      issues.push({
        type: 'capitalization',
        message:
          'Russian title capitalization differs from English - check if current style is appropriate',
        severity: 'low',
      });
    }

    // Check if title is appropriately concise
    if (russian.length > english.length * 3) {
      issues.push({
        type: 'title_length',
        message:
          'Title translation significantly longer - consider more concise Russian equivalent',
        severity: 'medium',
      });
    }

    return issues;
  }

  // Check Russian capitalization patterns
  hasInappropriateRussianCapitalization(english, russian) {
    // English often uses title case, Russian typically uses sentence case
    const englishWordCount = english.split(/\s+/).length;
    const russianWordCount = russian.split(/\s+/).length;

    if (englishWordCount > 1 && russianWordCount > 1) {
      const englishCapitalWords = english
        .split(/\s+/)
        .filter((word) => /^[A-Z]/.test(word)).length;
      const russianCapitalWords = russian
        .split(/\s+/)
        .filter((word) => /^[А-ЯЁ]/.test(word)).length;

      // If English has title case but Russian also has many capitals, might be over-capitalized
      return englishCapitalWords > 1 && russianCapitalWords > 1;
    }

    return false;
  }

  // Generate comprehensive analysis
  analyze() {
    console.log('🔍 Starting Russian translation analysis...\n');

    this.loadData();

    console.log('🔘 Analyzing button translations...');
    const buttonIssues = this.analyzeButtonTranslations();

    console.log('🔢 Analyzing variable handling...');
    const variableIssues = this.analyzeVariableTranslations();

    console.log('📝 Analyzing titles and headings...');
    const titleIssues = this.analyzeTitleTranslations();

    this.generateReport(buttonIssues, variableIssues, titleIssues);
  }

  // Generate comprehensive report
  generateReport(buttonIssues, variableIssues, titleIssues) {
    console.log('\n📊 RUSSIAN TRANSLATION ANALYSIS REPORT');
    console.log('='.repeat(50));

    const totalIssues =
      buttonIssues.length + variableIssues.length + titleIssues.length;

    console.log(`Total improvement opportunities found: ${totalIssues}\n`);

    // Button issues
    if (buttonIssues.length > 0) {
      console.log(`🔘 BUTTON TRANSLATION ISSUES (${buttonIssues.length})`);
      console.log('-'.repeat(30));
      buttonIssues.slice(0, 10).forEach((issue, index) => {
        console.log(`${index + 1}. "${issue.english}" → "${issue.russian}"`);
        console.log(`   Context: ${issue.context}`);
        issue.issues.forEach((i) => console.log(`   ⚠️  ${i.message}`));
        console.log('');
      });
      if (buttonIssues.length > 10) {
        console.log(
          `   ... and ${buttonIssues.length - 10} more button issues\n`,
        );
      }
    }

    // Variable issues
    if (variableIssues.length > 0) {
      console.log(`🔢 VARIABLE HANDLING ISSUES (${variableIssues.length})`);
      console.log('-'.repeat(30));
      variableIssues.slice(0, 10).forEach((issue, index) => {
        console.log(`${index + 1}. "${issue.english}" → "${issue.russian}"`);
        console.log(
          `   Variables: {${Object.keys(issue.variables).join('}, {')}}`,
        );
        issue.issues.forEach((i) => console.log(`   ⚠️  ${i.message}`));
        console.log('');
      });
      if (variableIssues.length > 10) {
        console.log(
          `   ... and ${variableIssues.length - 10} more variable issues\n`,
        );
      }
    }

    // Title issues
    if (titleIssues.length > 0) {
      console.log(`📝 TITLE TRANSLATION ISSUES (${titleIssues.length})`);
      console.log('-'.repeat(30));
      titleIssues.slice(0, 5).forEach((issue, index) => {
        console.log(`${index + 1}. "${issue.english}" → "${issue.russian}"`);
        console.log(`   Context: ${issue.context}`);
        issue.issues.forEach((i) => console.log(`   ⚠️  ${i.message}`));
        console.log('');
      });
      if (titleIssues.length > 5) {
        console.log(`   ... and ${titleIssues.length - 5} more title issues\n`);
      }
    }

    // Summary recommendations
    this.generateSummaryRecommendations(
      buttonIssues,
      variableIssues,
      titleIssues,
    );
  }

  // Generate summary recommendations
  generateSummaryRecommendations(buttonIssues, variableIssues, titleIssues) {
    console.log('💡 IMPROVEMENT RECOMMENDATIONS');
    console.log('='.repeat(40));

    const recommendations = [];

    if (buttonIssues.length > 0) {
      recommendations.push(
        '• Review button text for appropriate Russian imperative verb forms',
      );
      recommendations.push('• Consider shorter, more concise button labels');
      recommendations.push(
        '• Use stronger terminology for destructive actions (delete buttons)',
      );
      recommendations.push(
        '• Watch for common verb form errors: "reload" = "перезагрузить" (NOT "перезаряжать")',
      );
      recommendations.push(
        '• Watch for common noun errors: "staff" = "персонал" (NOT "посох" which means walking stick)',
      );
      recommendations.push(
        '• Distinguish action verbs: load/download vs charge, refresh vs reload',
      );
    }

    if (variableIssues.length > 0) {
      recommendations.push(
        '• Implement Russian number-noun agreement for count variables',
      );
      recommendations.push(
        '• Review variable positioning for natural Russian word order',
      );
      recommendations.push('• Add conditional plural forms where needed');
    }

    if (titleIssues.length > 0) {
      recommendations.push(
        '• Use Russian sentence case instead of English title case',
      );
      recommendations.push(
        '• Optimize title length for Russian language patterns',
      );
    }

    if (recommendations.length === 0) {
      console.log(
        '✅ Russian translations appear to be well-adapted to the context!',
      );
    } else {
      recommendations.forEach((rec) => console.log(rec));
    }

    console.log('\n🎯 PRIORITY ACTIONS:');
    console.log(
      '1. Focus on high-severity issues first (missing variables, inappropriate delete terms)',
    );
    console.log(
      '2. Review button and action text for Russian language conventions',
    );
    console.log(
      '3. Implement proper number-noun agreement for dynamic content',
    );
  }
}

// Execute if run directly
if (require.main === module) {
  const analyzer = new RussianTranslationAnalyzer();
  analyzer.analyze();
}

module.exports = RussianTranslationAnalyzer;
