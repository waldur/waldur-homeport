'use strict';

const fs = require('fs');
const path = require('path');

/**
 * SearchTranslations Tool
 * 
 * Efficiently searches for specific translation keys/values in locale files
 * without loading the entire file into memory
 */

class SearchTranslations {
  constructor(language = 'ru') {
    this.language = language;
    this.localeFile = path.join(__dirname, `../${language}.json`);
  }

  /**
   * Search for specific translation keys and return their current values
   * @param {string[]} keys - Array of translation keys to search for
   * @returns {Object} Object with key-value pairs of found translations
   */
  searchKeys(keys) {
    if (!fs.existsSync(this.localeFile)) {
      throw new Error(`Locale file not found: ${this.localeFile}`);
    }

    const results = {};
    const content = fs.readFileSync(this.localeFile, 'utf8');
    
    try {
      const translations = JSON.parse(content);
      
      for (const key of keys) {
        if (translations.hasOwnProperty(key)) {
          results[key] = translations[key];
        } else {
          results[key] = null; // Key not found
        }
      }
      
      return results;
    } catch (error) {
      throw new Error(`Error parsing locale file: ${error.message}`);
    }
  }

  /**
   * Search for translations matching a pattern
   * @param {string} pattern - Regex pattern to match against keys or values
   * @param {string} searchIn - 'keys', 'values', or 'both'
   * @param {number} limit - Maximum number of results
   * @returns {Object} Matching translations
   */
  searchPattern(pattern, searchIn = 'both', limit = 50) {
    if (!fs.existsSync(this.localeFile)) {
      throw new Error(`Locale file not found: ${this.localeFile}`);
    }

    const results = {};
    const content = fs.readFileSync(this.localeFile, 'utf8');
    const regex = new RegExp(pattern, 'i');
    let count = 0;
    
    try {
      const translations = JSON.parse(content);
      
      for (const [key, value] of Object.entries(translations)) {
        if (count >= limit) break;
        
        const keyMatch = searchIn === 'keys' || searchIn === 'both' ? regex.test(key) : false;
        const valueMatch = searchIn === 'values' || searchIn === 'both' ? regex.test(value) : false;
        
        if (keyMatch || valueMatch) {
          results[key] = value;
          count++;
        }
      }
      
      return results;
    } catch (error) {
      throw new Error(`Error parsing locale file: ${error.message}`);
    }
  }

  /**
   * Check if specific keys exist in the locale file
   * @param {string[]} keys - Array of translation keys to check
   * @returns {Object} Object with key existence status
   */
  checkKeysExist(keys) {
    if (!fs.existsSync(this.localeFile)) {
      throw new Error(`Locale file not found: ${this.localeFile}`);
    }

    const results = {};
    const content = fs.readFileSync(this.localeFile, 'utf8');
    
    try {
      const translations = JSON.parse(content);
      
      for (const key of keys) {
        results[key] = translations.hasOwnProperty(key);
      }
      
      return results;
    } catch (error) {
      throw new Error(`Error parsing locale file: ${error.message}`);
    }
  }

  /**
   * Get translation statistics without loading full file
   * @returns {Object} Statistics about the locale file
   */
  getStats() {
    if (!fs.existsSync(this.localeFile)) {
      throw new Error(`Locale file not found: ${this.localeFile}`);
    }

    const content = fs.readFileSync(this.localeFile, 'utf8');
    
    try {
      const translations = JSON.parse(content);
      const keys = Object.keys(translations);
      
      return {
        totalTranslations: keys.length,
        emptyTranslations: keys.filter(key => !translations[key] || translations[key].trim() === '').length,
        language: this.language,
        fileSize: content.length,
        lastModified: fs.statSync(this.localeFile).mtime
      };
    } catch (error) {
      throw new Error(`Error parsing locale file: ${error.message}`);
    }
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  const language = args[1] || 'ru';
  
  const searcher = new SearchTranslations(language);
  
  try {
    switch (command) {
      case 'search-keys':
        const keys = args.slice(2);
        if (keys.length === 0) {
          console.error('Usage: node searchTranslations.cjs search-keys <language> <key1> <key2> ...');
          process.exit(1);
        }
        const results = searcher.searchKeys(keys);
        console.log(JSON.stringify(results, null, 2));
        break;
        
      case 'search-pattern':
        const pattern = args[2];
        const searchIn = args[3] || 'both';
        const limit = parseInt(args[4]) || 50;
        if (!pattern) {
          console.error('Usage: node searchTranslations.cjs search-pattern <language> <pattern> [keys|values|both] [limit]');
          process.exit(1);
        }
        const patternResults = searcher.searchPattern(pattern, searchIn, limit);
        console.log(JSON.stringify(patternResults, null, 2));
        break;
        
      case 'check-exist':
        const checkKeys = args.slice(2);
        if (checkKeys.length === 0) {
          console.error('Usage: node searchTranslations.cjs check-exist <language> <key1> <key2> ...');
          process.exit(1);
        }
        const existResults = searcher.checkKeysExist(checkKeys);
        console.log(JSON.stringify(existResults, null, 2));
        break;
        
      case 'stats':
        const stats = searcher.getStats();
        console.log(JSON.stringify(stats, null, 2));
        break;
        
      default:
        console.log('Available commands:');
        console.log('  search-keys <language> <key1> <key2> ...     - Search for specific keys');
        console.log('  search-pattern <language> <pattern> [where]  - Search with regex pattern');
        console.log('  check-exist <language> <key1> <key2> ...     - Check if keys exist');
        console.log('  stats <language>                             - Get locale file statistics');
        break;
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

module.exports = SearchTranslations;