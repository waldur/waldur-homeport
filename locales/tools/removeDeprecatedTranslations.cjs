#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Remove deprecated translations from locale files.
 * A translation is considered deprecated if it exists in a locale file
 * but not in the template.json (which is generated from the codebase).
 */

const LOCALES_DIR = path.join(__dirname, '..');
const TEMPLATE_FILE = path.join(__dirname, '../../template.json');

function loadJson(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error loading ${filePath}:`, error.message);
    return null;
  }
}

function saveJson(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    return true;
  } catch (error) {
    console.error(`Error saving ${filePath}:`, error.message);
    return false;
  }
}

function getDeprecatedKeys(localeData, templateKeys) {
  const deprecatedKeys = [];
  
  // Locale files have flat structure: { "translation key": "translated value" }
  // We just need to check the top-level keys
  for (const key in localeData) {
    if (!templateKeys.has(key)) {
      deprecatedKeys.push(key);
    }
  }
  
  return deprecatedKeys;
}

function removeDeprecatedKeys(obj, keysToRemove) {
  const result = JSON.parse(JSON.stringify(obj)); // Deep clone
  
  // For flat locale structure, just remove the keys directly
  keysToRemove.forEach(key => {
    if (result.hasOwnProperty(key)) {
      delete result[key];
    }
  });
  
  return result;
}

function extractTemplateKeys(templateData) {
  const keys = new Set();
  
  // Template.json has structure: { "message text": { "message": "message text", ... } }
  // We need to extract the top-level keys, which are the actual translation strings
  for (const key in templateData) {
    keys.add(key);
  }
  
  return keys;
}


function main() {
  console.log('🧹 Removing deprecated translations from locale files...\n');
  
  // Load template.json
  const template = loadJson(TEMPLATE_FILE);
  if (!template) {
    console.error('❌ Failed to load template.json');
    process.exit(1);
  }
  
  const templateKeys = extractTemplateKeys(template);
  console.log(`📋 Found ${templateKeys.size} keys in template.json`);
  
  // Find all locale files
  const localeFiles = fs.readdirSync(LOCALES_DIR)
    .filter(file => file.endsWith('.json') && file !== 'template.json')
    .sort();
  
  if (localeFiles.length === 0) {
    console.log('ℹ️  No locale files found');
    return;
  }
  
  console.log(`🌍 Processing ${localeFiles.length} locale files...\n`);
  
  let totalRemoved = 0;
  const results = [];
  
  for (const localeFile of localeFiles) {
    const filePath = path.join(LOCALES_DIR, localeFile);
    const localeData = loadJson(filePath);
    
    if (!localeData) {
      console.log(`⚠️  Skipping ${localeFile} (failed to load)`);
      continue;
    }
    
    const deprecatedKeys = getDeprecatedKeys(localeData, templateKeys);
    
    if (deprecatedKeys.length > 0) {
      console.log(`🗑️  ${localeFile}: Found ${deprecatedKeys.length} deprecated keys`);
      
      if (deprecatedKeys.length <= 10) {
        deprecatedKeys.forEach(key => console.log(`   - ${key}`));
      } else {
        deprecatedKeys.slice(0, 5).forEach(key => console.log(`   - ${key}`));
        console.log(`   ... and ${deprecatedKeys.length - 5} more`);
      }
      
      const cleanedData = removeDeprecatedKeys(localeData, deprecatedKeys);
      
      if (saveJson(filePath, cleanedData)) {
        console.log(`✅ Updated ${localeFile}`);
        totalRemoved += deprecatedKeys.length;
        results.push({ file: localeFile, removed: deprecatedKeys.length });
      } else {
        console.log(`❌ Failed to update ${localeFile}`);
      }
    } else {
      console.log(`✅ ${localeFile}: No deprecated keys found`);
      results.push({ file: localeFile, removed: 0 });
    }
    
    console.log('');
  }
  
  // Summary
  console.log('📊 Summary:');
  console.log(`   Total deprecated keys removed: ${totalRemoved}`);
  console.log(`   Files processed: ${results.length}`);
  console.log(`   Files with changes: ${results.filter(r => r.removed > 0).length}`);
  
  if (totalRemoved > 0) {
    console.log('\n🎉 Cleanup completed! Run yarn i18n:check to verify the results.');
  } else {
    console.log('\n✨ All locale files are already clean!');
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };