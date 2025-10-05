'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Simple LLM Translation Processor
 * 
 * Generates direct prompts for Claude Code to update locale files
 */

class SimpleLLMProcessor {
  constructor(language = 'et') {
    this.language = language;
    this.template = {};
    this.translations = {};
    this.languageWisdom = '';
  }

  loadData() {
    const rootDir = path.join(__dirname, '../../');
    
    // Load template and translations
    this.template = JSON.parse(fs.readFileSync(path.join(rootDir, 'template.json'), 'utf8'));
    this.translations = JSON.parse(fs.readFileSync(path.join(rootDir, `locales/${this.language}.json`), 'utf8'));
    
    // Load language wisdom from analyzer
    this.loadLanguageWisdom();
    
    console.log(`📚 Loaded ${Object.keys(this.template).length} template entries`);
    console.log(`🌐 Loaded ${Object.keys(this.translations).length} ${this.language.toUpperCase()} translations`);
  }

  loadLanguageWisdom() {
    const analyzerFile = path.join(__dirname, `analyze${this.getLanguageName()}Translations.cjs`);
    
    if (fs.existsSync(analyzerFile)) {
      // Extract key wisdom from the analyzer
      const content = fs.readFileSync(analyzerFile, 'utf8');
      
      // Extract recommendations
      const recommendations = content.match(/generateRecommendations\(\) \{[\s\S]*?return \[([\s\S]*?)\];/);
      if (recommendations) {
        this.languageWisdom = recommendations[1]
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.startsWith("'") || line.startsWith('"'))
          .map(line => line.replace(/^['"]|['"],?$/g, ''))
          .join('\n');
      }
    }
  }

  getLanguageName() {
    const names = { 
      'et': 'Estonian', 
      'ru': 'Russian', 
      'de': 'German',
      'nb': 'Norwegian',
      'lv': 'Latvian',
      'lt': 'Lithuanian'
    };
    return names[this.language] || this.language.charAt(0).toUpperCase() + this.language.slice(1);
  }

  getAudienceDescription() {
    // Same audience regardless of language
    return 'IT professionals, system administrators, project managers, and business users working with cloud infrastructure and resource management in enterprise environments. Users are technically literate and familiar with cloud computing, DevOps, and business IT terminology.';
  }

  getToneGuidelines() {
    // Base professional tone for all languages
    const baseTone = 'Professional, clear, and concise language appropriate for enterprise software. ';
    
    // Language-specific nuances only
    const languageSpecifics = {
      'nb': 'Prefer modern Norwegian software conventions. Avoid overly formal or archaic language.',
      'et': 'Follow modern Estonian software conventions. Avoid unnecessary loanwords when good Estonian terms exist.',
      'ru': 'Balance formal business language with approachable technical terminology. Use formal "Вы" for addressing users.',
      'de': 'Maintain appropriate formality with Sie form throughout. Follow standard German software conventions.',
      'lv': 'Follow Baltic software UI conventions similar to Estonian patterns.',
      'lt': 'Maintain consistency with standard Lithuanian IT terminology.'
    };
    
    const specific = languageSpecifics[this.language] || 'Follow standard software UI conventions for the language.';
    return baseTone + specific;
  }

  getUIRules() {
    const rules = {
      'nb': `• Button labels: Short, action-oriented imperative verbs (e.g., "Lagre", "Avbryt", "Godkjenn")
• Avoid literal translations that sound unnatural (e.g., avoid "benekte" - use "avslå" instead)
• Use terms from real Norwegian software (Microsoft, Google conventions)
• Error messages: Polite but direct, using "beklager" for apologies
• Titles: Sentence case, not Title Case
• Prefer compound words over separate words when natural`,
      
      'et': `• Button labels: Use da-infinitive for actions (e.g., "Salvesta", "Kustuta", "Kinnita")
• Keep messages concise but complete sentences
• Use Estonian sentence case for titles
• Error messages: Use clear, direct language
• Prefer native Estonian terms over unnecessary English loanwords
• Numbers with nouns: Pay attention to singular/plural rules`,
      
      'ru': `• Button labels: Use perfective infinitive verbs (e.g., "Сохранить", "Удалить", "Создать")
• Avoid "посох" for staff - use "персонал"
• Avoid "перезаряжать" for reload - use "перезагрузить"
• Error messages: Professional tone with "пожалуйста" for courtesy
• Use formal "Вы" for user addressing
• Technical terms: Balance between international and Russian equivalents`,
      
      'de': `• Button labels: Imperative or infinitive forms (e.g., "Speichern", "Löschen", "Erstellen")
• Use formal "Sie" throughout the interface
• Compound words: Follow German conventions for technical terms
• Error messages: Professional and helpful with appropriate formality
• Consistent use of Denglish where accepted in IT contexts
• Precise technical terminology expected by German users`,
      
      'lv': `• Button labels: Short imperative forms
• Follow Baltic UI conventions similar to Estonian
• Professional tone throughout
• Use established Latvian IT terminology`,
      
      'lt': `• Button labels: Imperative verb forms
• Clear, professional Lithuanian
• Follow standard Lithuanian software conventions
• Maintain consistency with Lithuanian IT terminology`
    };
    return rules[this.language] || `• Button labels: Short, action-oriented verbs
• Error messages: Clear and helpful
• Professional tone throughout
• Follow standard UI conventions`;
  }

  // Generate focused batches for specific issue types
  generateFocusedBatch(issueType, limit = 30) {
    const entries = [];
    
    for (const [english, templateData] of Object.entries(this.template)) {
      const translation = this.translations[english];
      const uiType = templateData.context?.primary_ui_type || 'unknown';
      
      let include = false;
      let isMissing = false;
      
      // Check for missing translations first
      if (!translation) {
        isMissing = true;
        include = (issueType === 'missing');
      } else {
        // Filter existing translations by issue type
        switch (issueType) {
          case 'buttons':
            include = uiType.includes('button');
            break;
          case 'errors':
            include = uiType.includes('error');
            break;
          case 'titles':
            include = uiType.includes('title');
            break;
          case 'problematic':
            // Include translations that likely need improvement
            include = translation.length < 3 || 
                     translation === english || 
                     translation.includes('loanword patterns') ||
                     (uiType.includes('button') && !translation.match(/da$|mine$/));
            break;
          default:
            include = true;
        }
      }
      
      if (include) {
        entries.push({
          english,
          translation: translation || '[MISSING]',
          isMissing,
          context: templateData.context,
          description: templateData.description
        });
      }
      
      if (entries.length >= limit) break;
    }
    
    return entries;
  }

  // Generate a simple prompt for Claude Code
  generateClaudePrompt(issueType = 'buttons', limit = 30) {
    const entries = this.generateFocusedBatch(issueType, limit);
    const missingCount = entries.filter(e => e.isMissing).length;
    const improvingCount = entries.length - missingCount;
    
    const taskType = issueType === 'missing' ? 'add missing' : 'improve existing';
    const taskDescription = issueType === 'missing' ? 
      `Add ${this.getLanguageName()} translations for ${entries.length} missing entries` :
      `Improve ${improvingCount} existing ${this.getLanguageName()} translations`;
    
    return `Please ${taskType} ${this.getLanguageName()} translations in the locales/${this.language}.json file.

## Context: Waldur Cloud Management Platform

**Domain**: This is a professional cloud infrastructure and project management platform used by organizations to manage IT resources, costs, and teams.

**Audience**: ${this.getAudienceDescription()}

**Tone**: ${this.getToneGuidelines()}

## UI Translation Rules:

${this.getUIRules()}

## Language Guidelines for ${this.getLanguageName()}:
${this.languageWisdom}

**EFFICIENT WORKFLOW**: Use the specialized translation tools to avoid reading large files:

1. **SearchTranslations**: \`node locales/tools/searchTranslations.cjs search-keys ${this.language} [keys]\` - Get current values
2. **AnalyzeTranslations**: \`node locales/tools/analyzeTranslations.cjs\` - Compare and find what needs changes  
3. **TranslationEdit**: \`node locales/tools/translationEdit.cjs apply ${this.language} input.json\` - Apply changes atomically

## Focus: ${issueType}
${this.getFocusGuidance(issueType)}

## ${taskDescription}:

**Translation Data** (keys with rich context):

${entries.map(entry => {
  const status = entry.isMissing ? '[MISSING - ADD TRANSLATION]' : entry.translation;
  const ctx = entry.context || {};
  
  // Build rich context description
  const contextParts = [];
  
  // UI Context
  if (ctx.primary_ui_type) contextParts.push(`UI: ${ctx.primary_ui_type}`);
  
  // Text characteristics 
  if (ctx.text_characteristics) {
    const tc = ctx.text_characteristics;
    const charInfo = [];
    if (tc.isQuestion) charInfo.push('question');
    if (tc.isExclamation) charInfo.push('exclamation');
    if (tc.isSentence) charInfo.push('sentence');
    if (tc.hasVariables) charInfo.push('has-variables');
    if (tc.isAllCaps) charInfo.push('all-caps');
    if (charInfo.length > 0) contextParts.push(`Text: ${charInfo.join(',')}`);
  }
  
  // Feature area
  if (ctx.file_context?.feature_areas?.length > 0) {
    contextParts.push(`Feature: ${ctx.file_context.feature_areas[0]}`);
  }
  
  // Action context
  if (ctx.action_types?.length > 0 && ctx.action_types[0] !== 'unknown') {
    contextParts.push(`Action: ${ctx.action_types[0]}`);
  }
  
  // Variables info
  if (ctx.variables && Object.keys(ctx.variables).length > 0) {
    const varTypes = Object.values(ctx.variables).map(v => v.type).filter(Boolean);
    if (varTypes.length > 0) contextParts.push(`Variables: ${varTypes.join(',')}`);
  }
  
  // API context
  if (ctx.api_context?.has_api_calls) {
    contextParts.push('API-related');
  }
  
  // Location info
  const locations = entry.description ? ` | Files: ${entry.description.split(',').slice(0,2).join(', ')}${entry.description.split(',').length > 2 ? '...' : ''}` : '';
  
  const contextStr = contextParts.length > 0 ? contextParts.join(' | ') : 'general';
  
  return `"${entry.english}": "${status}"  // ${contextStr}${locations}`;
}).join('\n')}

**Recommended Workflow**:

1. Use \`SearchTranslations\` to get current values for these keys
2. Create a JSON file with your improved translations
3. Use \`AnalyzeTranslations\` to verify only necessary changes
4. Use \`TranslationEdit\` to apply changes atomically with backup

Or use traditional Edit/MultiEdit tools but focus ONLY on the keys listed above. ${issueType === 'missing' ? 'Add new entries for missing translations.' : 'Only change translations that need improvement.'}

## Translation Guidelines:

### General Guidelines:
1. **Grammatical correctness** - Use proper ${this.getLanguageName()} grammar and syntax
2. **Cultural appropriateness** - Adapt tone and formality to target culture  
3. **UI/UX best practices** - Consider the UI element type and user experience
4. **Consistency** - Follow ${this.getLanguageName()} language patterns and existing terminology

### Context-Specific Guidelines:
${this.getContextSpecificGuidelines(entries)}

### Translator Notes from Template:
${this.getTranslatorNotes(entries)}

${issueType === 'missing' ? 'For missing translations, provide natural, contextually appropriate translations based on the rich context provided.' : 'Keep good existing translations as they are - only improve those with clear issues.'}`;
  }

  // Extract context-specific guidelines
  getContextSpecificGuidelines(entries) {
    const guidelines = new Set();
    
    entries.forEach(entry => {
      const ctx = entry.context || {};
      
      // UI-specific guidelines
      if (ctx.primary_ui_type?.includes('button')) {
        guidelines.add('**Buttons**: Use imperative forms, keep concise, action-oriented');
      }
      if (ctx.primary_ui_type?.includes('error')) {
        guidelines.add('**Error Messages**: Be polite, helpful, and include appropriate courtesy markers');
      }
      if (ctx.primary_ui_type?.includes('title')) {
        guidelines.add('**Titles**: Use sentence case, prefer native terminology over loanwords');
      }
      
      // Text characteristics
      if (ctx.text_characteristics?.isQuestion) {
        guidelines.add('**Questions**: Ensure proper question format and punctuation');
      }
      if (ctx.text_characteristics?.hasVariables) {
        guidelines.add('**Variables**: Consider variable reordering, plural handling, and context');
      }
      if (ctx.text_characteristics?.isAllCaps) {
        guidelines.add('**Emphasis**: Consider if ALL CAPS emphasis is appropriate in your language');
      }
      
      // Feature-specific
      if (ctx.file_context?.feature_areas?.includes('marketplace')) {
        guidelines.add('**Marketplace**: Use commercial/business-appropriate terminology');
      }
      if (ctx.api_context?.has_api_calls) {
        guidelines.add('**API-related**: Technical terms may need careful localization vs keeping English');
      }
    });
    
    return Array.from(guidelines).join('\n');
  }

  // Extract translator notes from template
  getTranslatorNotes(entries) {
    const notes = new Set();
    
    entries.forEach(entry => {
      const templateData = this.template[entry.english];
      if (templateData?.translator_notes && Array.isArray(templateData.translator_notes)) {
        templateData.translator_notes.forEach(note => notes.add(`- ${note}`));
      }
    });
    
    return notes.size > 0 ? Array.from(notes).join('\n') : '- No specific translator notes available';
  }

  getFocusGuidance(issueType) {
    const guidance = {
      buttons: `- Use proper ${this.getLanguageName()} imperative forms
- Keep text short and action-oriented
- Ensure consistency across similar actions`,
      
      errors: `- Use polite, helpful language
- Include appropriate courtesy markers
- Make messages user-friendly and clear`,
      
      titles: `- Use sentence case (not title case)
- Prefer native terminology over loanwords
- Ensure clarity and consistency`,
      
      problematic: `- Fix obvious issues (too short, English text, etc.)
- Improve grammatical accuracy
- Apply ${this.getLanguageName()} language patterns`,
      
      missing: `- Provide natural, contextually appropriate translations
- Consider UI element type and usage context
- Follow ${this.getLanguageName()} language conventions
- Ensure consistency with existing translations`
    };
    
    return guidance[issueType] || 'General translation quality improvements';
  }

  // Get missing translation count
  getMissingCount() {
    let missing = 0;
    for (const english of Object.keys(this.template)) {
      if (!this.translations[english]) {
        missing++;
      }
    }
    return missing;
  }

  // Generate prompts for all issue types
  generateAllPrompts() {
    const types = ['missing', 'problematic', 'buttons', 'errors', 'titles'];
    const prompts = {};
    
    for (const type of types) {
      const entries = this.generateFocusedBatch(type, 30);
      if (entries.length > 0) {
        prompts[type] = this.generateClaudePrompt(type);
      }
    }
    
    return prompts;
  }

  // Save prompts to files for easy copy-paste
  savePromptsToFiles() {
    const outputDir = path.join(__dirname, '../llm-prompts');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const prompts = this.generateAllPrompts();
    const missingCount = this.getMissingCount();
    
    for (const [type, prompt] of Object.entries(prompts)) {
      const filename = `${this.language}-${type}-improvements.txt`;
      const filepath = path.join(outputDir, filename);
      fs.writeFileSync(filepath, prompt, 'utf8');
      console.log(`📝 Saved prompt: ${filename}`);
    }
    
    // Create a summary file
    const summary = `# ${this.getLanguageName()} Translation Improvement Prompts

Generated on: ${new Date().toISOString()}

## Translation Status:
- **Total translations needed**: ${Object.keys(this.template).length}
- **Current translations**: ${Object.keys(this.translations).length}
- **Missing translations**: ${missingCount}
- **Coverage**: ${Math.round((Object.keys(this.translations).length / Object.keys(this.template).length) * 100)}%

## Usage Instructions:

1. **Copy a prompt** from one of the files below
2. **Paste into Claude Code** 
3. **Let Claude directly edit** locales/${this.language}.json
4. **Git will track changes** automatically
5. **Review and commit** the improvements

## Available Prompts:

${Object.keys(prompts).map(type => {
  const entryCount = this.generateFocusedBatch(type, 30).length;
  return `- **${type}**: ${this.language}-${type}-improvements.txt (${entryCount} entries)`;
}).join('\n')}

## Recommended Order:

${missingCount > 0 ? '1. Start with **missing** - adds missing translations\n2. Then **problematic** - fixes obvious issues' : '1. Start with **problematic** - fixes obvious issues'}
3. Then **errors** - improves user experience  
4. Then **buttons** - enhances UI consistency
5. Finally **titles** - polishes terminology

Each prompt processes ~30 translations for focused improvement.
`;
    
    fs.writeFileSync(path.join(outputDir, `${this.language}-README.md`), summary, 'utf8');
    console.log(`📋 Saved instructions: ${this.language}-README.md`);
    
    return outputDir;
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const language = args[0] || 'et';
  const issueType = args[1] || 'all';
  
  const processor = new SimpleLLMProcessor(language);
  processor.loadData();
  
  if (issueType === 'all') {
    processor.savePromptsToFiles();
    console.log(`\n✅ Generated prompts for ${language.toUpperCase()}`);
    console.log(`📁 Files saved to: locales/llm-prompts/`);
    console.log(`\n💡 Next steps:`);
    console.log(`1. Open the generated prompt files`);
    console.log(`2. Copy a prompt and paste into your LLM (Claude, ChatGPT, etc.)`);
    console.log(`3. Let the LLM edit locales/${language}.json directly`);
    console.log(`4. Review and commit changes with git`);
  } else {
    console.log(processor.generateClaudePrompt(issueType));
  }
}

module.exports = SimpleLLMProcessor;