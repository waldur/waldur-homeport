'use strict';

const TranslationAnalyzer = require('./checkTranslations.cjs');

/**
 * Translation Validation for CI/CD
 * 
 * This script validates translation completeness and fails CI if issues are found
 */

class TranslationValidator {
  constructor(options = {}) {
    this.options = {
      maxUnusedTranslations: options.maxUnusedTranslations || 50,
      maxMissingTranslations: options.maxMissingTranslations || 100,
      failOnUnused: options.failOnUnused || false,
      failOnMissing: options.failOnMissing || false,
      warnOnly: options.warnOnly || false,
      ...options
    };
  }

  validate() {
    console.log('🔍 Validating translations for CI/CD...\n');
    
    const analyzer = new TranslationAnalyzer();
    
    // Suppress normal output by overriding console methods temporarily
    const originalLog = console.log;
    const logs = [];
    console.log = (...args) => logs.push(args.join(' '));
    
    try {
      analyzer.analyze();
    } finally {
      console.log = originalLog;
    }
    
    // Parse results
    const template = analyzer.loadTemplate();
    const totalKeys = Object.keys(template).length;
    const usedKeys = analyzer.usedTranslations.size;
    const unusedKeys = totalKeys - usedKeys;
    const missingKeys = analyzer.potentialMissing.size;
    
    // Generate validation report
    let hasErrors = false;
    let hasWarnings = false;
    
    console.log('📊 TRANSLATION VALIDATION REPORT');
    console.log('=' .repeat(40));
    console.log(`Total translation keys: ${totalKeys}`);
    console.log(`Used translation keys: ${usedKeys}`);
    console.log(`Unused translation keys: ${unusedKeys}`);
    console.log(`Potential missing translations: ${missingKeys}`);
    console.log(`Usage rate: ${((usedKeys / totalKeys) * 100).toFixed(1)}%\n`);
    
    // Check unused translations
    if (unusedKeys > this.options.maxUnusedTranslations) {
      const message = `❌ Too many unused translations: ${unusedKeys} (max: ${this.options.maxUnusedTranslations})`;
      if (this.options.failOnUnused && !this.options.warnOnly) {
        console.error(message);
        hasErrors = true;
      } else {
        console.warn(`⚠️  ${message.slice(2)}`);
        hasWarnings = true;
      }
    } else if (unusedKeys > 0) {
      console.log(`ℹ️  Found ${unusedKeys} unused translations (within acceptable limit)`);
    }
    
    // Check missing translations
    if (missingKeys > this.options.maxMissingTranslations) {
      const message = `❌ Too many potential missing translations: ${missingKeys} (max: ${this.options.maxMissingTranslations})`;
      if (this.options.failOnMissing && !this.options.warnOnly) {
        console.error(message);
        hasErrors = true;
      } else {
        console.warn(`⚠️  ${message.slice(2)}`);
        hasWarnings = true;
      }
    } else if (missingKeys > 0) {
      console.log(`ℹ️  Found ${missingKeys} potential missing translations (within acceptable limit)`);
    }
    
    // Final result
    console.log('');
    if (hasErrors) {
      console.error('❌ Translation validation FAILED');
      console.log('\nTo fix these issues:');
      console.log('1. Run "yarn i18n:check" to see detailed issues');
      console.log('2. Run "yarn i18n:clean --dry-run" to see what would be cleaned');
      console.log('3. Run "yarn i18n:clean" to remove unused translations');
      console.log('4. Address missing translations by adding translate() calls');
      process.exit(1);
    } else if (hasWarnings) {
      console.warn('⚠️  Translation validation completed with warnings');
      if (!this.options.warnOnly) {
        console.log('\nConsider running "yarn i18n:check" to review issues');
      }
    } else {
      console.log('✅ Translation validation PASSED');
    }
    
    return { totalKeys, usedKeys, unusedKeys, missingKeys, hasErrors, hasWarnings };
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};
  
  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--max-unused':
        options.maxUnusedTranslations = parseInt(args[++i]) || 50;
        break;
      case '--max-missing':
        options.maxMissingTranslations = parseInt(args[++i]) || 100;
        break;
      case '--fail-on-unused':
        options.failOnUnused = true;
        break;
      case '--fail-on-missing':
        options.failOnMissing = true;
        break;
      case '--warn-only':
        options.warnOnly = true;
        break;
      case '--help':
        console.log(`
Translation Validator

Usage: node validateTranslations.cjs [options]

Options:
  --max-unused N      Maximum allowed unused translations (default: 50)
  --max-missing N     Maximum allowed missing translations (default: 100)
  --fail-on-unused    Fail if unused translations exceed limit
  --fail-on-missing   Fail if missing translations exceed limit
  --warn-only         Show warnings but don't fail CI
  --help              Show this help message

Examples:
  node validateTranslations.cjs --max-unused 10 --fail-on-unused
  node validateTranslations.cjs --warn-only
        `);
        process.exit(0);
        break;
    }
  }
  
  const validator = new TranslationValidator(options);
  validator.validate();
}

module.exports = TranslationValidator;