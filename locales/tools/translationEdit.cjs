'use strict';

const fs = require('fs');
const path = require('path');

/**
 * TranslationEdit Tool
 *
 * Handles atomic batch updates of translations with validation,
 * proper JSON formatting, and error recovery
 */

class TranslationEdit {
  constructor(language = 'ru') {
    this.language = language;
    this.localeFile = path.join(__dirname, `../${language}.json`);
    this.templateFile = path.join(__dirname, '../../template.json');
  }

  /**
   * Apply multiple translation updates atomically
   * @param {Object} translations - Object with key-value pairs to update/add
   * @param {Object} options - Options for the update
   * @returns {Object} Results of the update operation
   */
  applyTranslations(translations, options = {}) {
    const {
      validateKeys = true,
      createBackup = true,
      dryRun = false,
      sortKeys = true,
    } = options;

    const results = {
      success: false,
      applied: [],
      skipped: [],
      errors: [],
      backup: null,
      summary: {},
    };

    try {
      // Validate input
      if (!translations || typeof translations !== 'object') {
        throw new Error('Translations must be an object');
      }

      // Load current locale file
      let currentTranslations = {};
      if (fs.existsSync(this.localeFile)) {
        const content = fs.readFileSync(this.localeFile, 'utf8');
        currentTranslations = JSON.parse(content);
      }

      // Validate keys if requested
      if (validateKeys) {
        const validation = this.validateKeys(Object.keys(translations));
        if (validation.invalid.length > 0) {
          results.errors.push(
            `Invalid keys found: ${validation.invalid.join(', ')}`,
          );
        }
        // Continue with valid keys only
        for (const invalidKey of validation.invalid) {
          delete translations[invalidKey];
          results.skipped.push({ key: invalidKey, reason: 'Invalid key' });
        }
      }

      // Create backup if requested
      if (createBackup && !dryRun) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = path.join(
          path.dirname(this.localeFile),
          `${this.language}.backup.${timestamp}.json`,
        );
        fs.writeFileSync(
          backupFile,
          JSON.stringify(currentTranslations, null, 2),
          'utf8',
        );
        results.backup = backupFile;
      }

      // Apply translations
      const updatedTranslations = { ...currentTranslations };

      for (const [key, value] of Object.entries(translations)) {
        // Skip empty or placeholder values
        if (
          !value ||
          value === '[MISSING]' ||
          value === '[MISSING - ADD TRANSLATION]'
        ) {
          results.skipped.push({ key, reason: 'Empty or placeholder value' });
          continue;
        }

        // Check if translation actually changed
        if (currentTranslations[key] === value) {
          results.skipped.push({ key, reason: 'No change needed' });
          continue;
        }

        updatedTranslations[key] = value;
        results.applied.push({
          key,
          oldValue: currentTranslations[key] || null,
          newValue: value,
          action: currentTranslations.hasOwnProperty(key) ? 'updated' : 'added',
        });
      }

      // Sort keys if requested
      let finalTranslations = updatedTranslations;
      if (sortKeys) {
        finalTranslations = {};
        const sortedKeys = Object.keys(updatedTranslations).sort();
        for (const key of sortedKeys) {
          finalTranslations[key] = updatedTranslations[key];
        }
      }

      // Write updated file (unless dry run)
      if (!dryRun) {
        const jsonContent = JSON.stringify(finalTranslations, null, 2) + '\n';
        fs.writeFileSync(this.localeFile, jsonContent, 'utf8');
      }

      // Generate summary
      results.summary = {
        totalProvided: Object.keys(translations).length,
        applied: results.applied.length,
        skipped: results.skipped.length,
        errors: results.errors.length,
        dryRun,
      };

      results.success = results.errors.length === 0;
    } catch (error) {
      results.errors.push(`Fatal error: ${error.message}`);
      results.success = false;
    }

    return results;
  }

  /**
   * Validate translation keys against template
   * @param {string[]} keys - Array of keys to validate
   * @returns {Object} Validation results
   */
  validateKeys(keys) {
    const results = {
      valid: [],
      invalid: [],
      missing: [],
    };

    // Load template for validation
    let template = {};
    if (fs.existsSync(this.templateFile)) {
      try {
        template = JSON.parse(fs.readFileSync(this.templateFile, 'utf8'));
      } catch {
        // If template can't be loaded, consider all keys valid
        console.warn('Could not load template.json, skipping key validation');
        results.valid = [...keys];
        return results;
      }
    } else {
      // No template file, consider all keys valid
      results.valid = [...keys];
      return results;
    }

    for (const key of keys) {
      if (template.hasOwnProperty(key)) {
        results.valid.push(key);
      } else {
        results.invalid.push(key);
      }
    }

    return results;
  }

  /**
   * Get current translation values for specific keys
   * @param {string[]} keys - Array of keys to retrieve
   * @returns {Object} Current translations for the specified keys
   */
  getCurrentTranslations(keys) {
    if (!fs.existsSync(this.localeFile)) {
      return {};
    }

    const content = fs.readFileSync(this.localeFile, 'utf8');
    const currentTranslations = JSON.parse(content);
    const results = {};

    for (const key of keys) {
      if (currentTranslations.hasOwnProperty(key)) {
        results[key] = currentTranslations[key];
      }
    }

    return results;
  }

  /**
   * Remove translations (useful for cleanup)
   * @param {string[]} keys - Array of keys to remove
   * @param {Object} options - Options for removal
   * @returns {Object} Results of the removal operation
   */
  removeTranslations(keys, options = {}) {
    const { createBackup = true, dryRun = false } = options;

    const results = {
      success: false,
      removed: [],
      notFound: [],
      errors: [],
      backup: null,
    };

    try {
      if (!fs.existsSync(this.localeFile)) {
        throw new Error(`Locale file not found: ${this.localeFile}`);
      }

      const content = fs.readFileSync(this.localeFile, 'utf8');
      const currentTranslations = JSON.parse(content);

      // Create backup if requested
      if (createBackup && !dryRun) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = path.join(
          path.dirname(this.localeFile),
          `${this.language}.backup.${timestamp}.json`,
        );
        fs.writeFileSync(
          backupFile,
          JSON.stringify(currentTranslations, null, 2),
          'utf8',
        );
        results.backup = backupFile;
      }

      // Remove keys
      const updatedTranslations = { ...currentTranslations };

      for (const key of keys) {
        if (updatedTranslations.hasOwnProperty(key)) {
          delete updatedTranslations[key];
          results.removed.push(key);
        } else {
          results.notFound.push(key);
        }
      }

      // Write updated file (unless dry run)
      if (!dryRun && results.removed.length > 0) {
        const jsonContent = JSON.stringify(updatedTranslations, null, 2) + '\n';
        fs.writeFileSync(this.localeFile, jsonContent, 'utf8');
      }

      results.success = true;
    } catch (error) {
      results.errors.push(`Error: ${error.message}`);
      results.success = false;
    }

    return results;
  }

  /**
   * Get file statistics
   * @returns {Object} Statistics about the locale file
   */
  getFileStats() {
    if (!fs.existsSync(this.localeFile)) {
      return { exists: false };
    }

    const content = fs.readFileSync(this.localeFile, 'utf8');
    const translations = JSON.parse(content);
    const stats = fs.statSync(this.localeFile);

    return {
      exists: true,
      totalTranslations: Object.keys(translations).length,
      fileSize: content.length,
      lastModified: stats.mtime,
      emptyTranslations: Object.values(translations).filter(
        (v) => !v || v.trim() === '',
      ).length,
    };
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  const language = args[1] || 'ru';

  const editor = new TranslationEdit(language);

  try {
    switch (command) {
      case 'apply':
        const inputFile = args[2];
        const dryRun = args.includes('--dry-run');

        if (!inputFile || !fs.existsSync(inputFile)) {
          console.error(
            'Usage: node translationEdit.cjs apply <language> <input.json> [--dry-run]',
          );
          process.exit(1);
        }

        const translations = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
        const results = editor.applyTranslations(translations, { dryRun });
        console.log(JSON.stringify(results, null, 2));
        break;

      case 'remove':
        const keys = args.slice(2).filter((arg) => !arg.startsWith('--'));
        const dryRunRemove = args.includes('--dry-run');

        if (keys.length === 0) {
          console.error(
            'Usage: node translationEdit.cjs remove <language> <key1> <key2> ... [--dry-run]',
          );
          process.exit(1);
        }

        const removeResults = editor.removeTranslations(keys, {
          dryRun: dryRunRemove,
        });
        console.log(JSON.stringify(removeResults, null, 2));
        break;

      case 'get':
        const getKeys = args.slice(2);
        if (getKeys.length === 0) {
          console.error(
            'Usage: node translationEdit.cjs get <language> <key1> <key2> ...',
          );
          process.exit(1);
        }

        const currentTranslations = editor.getCurrentTranslations(getKeys);
        console.log(JSON.stringify(currentTranslations, null, 2));
        break;

      case 'stats':
        const stats = editor.getFileStats();
        console.log(JSON.stringify(stats, null, 2));
        break;

      default:
        console.log('Available commands:');
        console.log(
          '  apply <language> <input.json> [--dry-run]  - Apply translation updates',
        );
        console.log(
          '  remove <language> <key1> <key2> ... [--dry-run] - Remove translations',
        );
        console.log(
          '  get <language> <key1> <key2> ...           - Get current translations',
        );
        console.log(
          '  stats <language>                           - Get file statistics',
        );
        break;
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

module.exports = TranslationEdit;
