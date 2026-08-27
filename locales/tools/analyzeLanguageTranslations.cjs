'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Unified Language Translation Analyzer
 *
 * Dynamically loads and runs language-specific translation analyzers
 * Usage: node analyzeLanguageTranslations.cjs <language_code>
 */

function showUsage() {
  console.log('Usage: node analyzeLanguageTranslations.cjs <language_code>');
  console.log('');
  console.log('Available language codes:');

  // Scan for available analyzer files
  const toolsDir = __dirname;
  const analyzerFiles = fs
    .readdirSync(toolsDir)
    .filter(
      (file) => file.startsWith('analyze') && file.endsWith('Translations.cjs'),
    )
    .filter(
      (file) =>
        file !== 'analyzeTranslations.cjs' &&
        file !== 'analyzeLanguageTranslations.cjs',
    )
    .map((file) => {
      const match = file.match(/analyze(.+)Translations\.cjs$/);
      return match ? match[1].toLowerCase() : null;
    })
    .filter(Boolean)
    .sort();

  // Map language names to codes for display
  const languageMap = {
    arabic: 'ar',
    azerbaijani: 'az',
    bengali: 'bn',
    bulgarian: 'bg',
    croatian: 'hr',
    czech: 'cs',
    danish: 'da',
    dutch: 'nl',
    belgiandutch: 'nl-BE',
    estonian: 'et',
    finnish: 'fi',
    french: 'fr',
    german: 'de',
    greek: 'el',
    italian: 'it',
    kyrgyz: 'ky',
    latvian: 'lv',
    lithuanian: 'lt',
    norwegian: 'nb',
    persian: 'fa',
    polish: 'pl',
    russian: 'ru',
    slovenian: 'sl',
    spanish: 'es',
    swedish: 'sv',
    thai: 'th',
    ukrainian: 'uk',
  };

  analyzerFiles.forEach((lang) => {
    const code = languageMap[lang] || lang;
    console.log(
      `  ${code.padEnd(6)} - ${lang.charAt(0).toUpperCase() + lang.slice(1)}`,
    );
  });

  console.log('');
  console.log('Examples:');
  console.log(
    '  node analyzeLanguageTranslations.cjs et    # Analyze Estonian',
  );
  console.log('  node analyzeLanguageTranslations.cjs ru    # Analyze Russian');
  console.log(
    '  node analyzeLanguageTranslations.cjs bg    # Analyze Bulgarian',
  );
}

function getAnalyzerFileName(langCode) {
  // Map language codes to analyzer file names
  const codeToAnalyzer = {
    ar: 'analyzeArabicTranslations.cjs',
    az: 'analyzeAzerbaijaniTranslations.cjs',
    bg: 'analyzeBulgarianTranslations.cjs',
    bn: 'analyzeBengaliTranslations.cjs',
    cs: 'analyzeCzechTranslations.cjs',
    da: 'analyzeDanishTranslations.cjs',
    de: 'analyzeGermanTranslations.cjs',
    el: 'analyzeGreekTranslations.cjs',
    es: 'analyzeSpanishTranslations.cjs',
    et: 'analyzeEstonianTranslations.cjs',
    fa: 'analyzePersianTranslations.cjs',
    fi: 'analyzeFinnishTranslations.cjs',
    fr: 'analyzeFrenchTranslations.cjs',
    hr: 'analyzeCroatianTranslations.cjs',
    it: 'analyzeItalianTranslations.cjs',
    ky: 'analyzeKyrgyzTranslations.cjs',
    lt: 'analyzeLithuanianTranslations.cjs',
    lv: 'analyzeLatvianTranslations.cjs',
    nb: 'analyzeNorwegianTranslations.cjs',
    nl: 'analyzeDutchTranslations.cjs',
    'nl-BE': 'analyzeBelgianDutchTranslations.cjs',
    pl: 'analyzePolishTranslations.cjs',
    ru: 'analyzeRussianTranslations.cjs',
    sl: 'analyzeSlovenianTranslations.cjs',
    sv: 'analyzeSwedishTranslations.cjs',
    th: 'analyzeThaiTranslations.cjs',
    uk: 'analyzeUkrainianTranslations.cjs',
  };

  return codeToAnalyzer[langCode] || null;
}

function runAnalyzer() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    showUsage();
    return;
  }

  const langCode = args[0].toLowerCase();
  const analyzerFile = getAnalyzerFileName(langCode);

  if (!analyzerFile) {
    console.error(
      `❌ Error: No analyzer found for language code '${langCode}'`,
    );
    console.error('');
    showUsage();
    process.exit(1);
  }

  const analyzerPath = path.join(__dirname, analyzerFile);

  if (!fs.existsSync(analyzerPath)) {
    console.error(`❌ Error: Analyzer file not found: ${analyzerFile}`);
    console.error('Expected path:', analyzerPath);
    process.exit(1);
  }

  // Check if translation file exists
  const translationFile = path.join(__dirname, '../', `${langCode}.json`);
  if (!fs.existsSync(translationFile)) {
    console.error(
      `❌ Error: Translation file not found: locales/${langCode}.json`,
    );
    console.error(
      'Please create the translation file first or check the language code.',
    );
    process.exit(1);
  }

  console.log(`🔍 Running ${langCode.toUpperCase()} translation analysis...`);
  console.log(`📁 Using analyzer: ${analyzerFile}`);
  console.log(`📄 Translation file: locales/${langCode}.json`);
  console.log('');

  try {
    // Load and run the analyzer
    const AnalyzerClass = require(analyzerPath);
    const analyzer = new AnalyzerClass();
    analyzer.analyze();
  } catch (error) {
    console.error(`❌ Error running analyzer: ${error.message}`);
    console.error('');
    console.error('Stack trace:');
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the analyzer
if (require.main === module) {
  runAnalyzer();
}

module.exports = { getAnalyzerFileName, runAnalyzer };
