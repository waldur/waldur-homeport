'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Translation Cleanup Tool
 * 
 * This script removes unused translation keys from template.json
 * based on the analysis from checkTranslations.cjs
 */

const TranslationAnalyzer = require('./checkTranslations.cjs');

class TranslationCleaner {
  constructor() {
    this.templateFile = path.join(__dirname, '../../template.json');
    this.backupFile = path.join(__dirname, `../../template.backup.${Date.now()}.json`);
  }

  // Load current template
  loadTemplate() {
    try {
      const templateContent = fs.readFileSync(this.templateFile, 'utf8');
      return JSON.parse(templateContent);
    } catch (error) {
      console.error(`Error loading template file: ${error.message}`);
      process.exit(1);
    }
  }

  // Save template with proper formatting
  saveTemplate(template) {
    const sortedTemplate = Object.fromEntries(
      Object.entries(template).sort(([a], [b]) => a.localeCompare(b))
    );
    
    fs.writeFileSync(
      this.templateFile,
      JSON.stringify(sortedTemplate, null, 2) + '\n',
      'utf8'
    );
  }

  // Create backup of current template
  createBackup(template) {
    fs.writeFileSync(
      this.backupFile,
      JSON.stringify(template, null, 2) + '\n',
      'utf8'
    );
    console.log(`✅ Backup created: ${path.basename(this.backupFile)}`);
  }

  // Main cleanup function
  cleanup(dryRun = false) {
    console.log('🧹 Starting translation cleanup...\n');
    
    // Analyze current state
    const analyzer = new TranslationAnalyzer();
    analyzer.allTsFiles = analyzer.getAllTSFiles(analyzer.constructor.CONFIG?.srcDir || path.join(__dirname, '../../src'));
    
    console.log(`📁 Processing ${analyzer.allTsFiles.length} TypeScript files...`);
    
    // Process all files to find used translations
    analyzer.allTsFiles.forEach(filePath => analyzer.processFile(filePath));
    
    // Load template
    const template = this.loadTemplate();
    const allTemplateKeys = new Set(Object.keys(template));
    
    console.log(`📋 Template contains ${allTemplateKeys.size} translation keys`);
    console.log(`✅ Found ${analyzer.usedTranslations.size} used translation keys\n`);
    
    // Find unused translations
    const unusedTranslations = new Set([...allTemplateKeys].filter(key => !analyzer.usedTranslations.has(key)));
    
    if (unusedTranslations.size === 0) {
      console.log('✅ No unused translations found! Template is clean.\n');
      return;
    }

    console.log(`🗑️  Found ${unusedTranslations.size} unused translations:`);
    console.log('=' .repeat(50));
    
    const sortedUnused = [...unusedTranslations].sort();
    sortedUnused.forEach((key, index) => {
      if (index < 20) { // Show first 20
        console.log(`   "${key}"`);
      } else if (index === 20) {
        console.log(`   ... and ${unusedTranslations.size - 20} more`);
      }
    });
    console.log('');

    if (dryRun) {
      console.log('🔍 DRY RUN: No changes made to template.json');
      console.log(`   Would remove ${unusedTranslations.size} unused translation keys`);
      return;
    }

    // Create backup before making changes
    this.createBackup(template);

    // Remove unused translations
    const cleanedTemplate = {};
    for (const [key, value] of Object.entries(template)) {
      if (!unusedTranslations.has(key)) {
        cleanedTemplate[key] = value;
      }
    }

    // Save cleaned template
    this.saveTemplate(cleanedTemplate);

    console.log(`✅ Cleanup complete!`);
    console.log(`   Removed ${unusedTranslations.size} unused translations`);
    console.log(`   Template now contains ${Object.keys(cleanedTemplate).length} translation keys`);
    console.log(`   Backup saved as: ${path.basename(this.backupFile)}`);
  }
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run') || args.includes('-n');
  
  if (dryRun) {
    console.log('🔍 Running in DRY RUN mode - no changes will be made\n');
  }
  
  const cleaner = new TranslationCleaner();
  cleaner.cleanup(dryRun);
}

module.exports = TranslationCleaner;