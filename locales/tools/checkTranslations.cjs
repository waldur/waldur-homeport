'use strict';

const fs = require('fs');
const path = require('path');

const ts = require('typescript');

/**
 * Translation Analysis Tool
 *
 * This script performs two main functions:
 * 1. Detects unused translation strings in template.json
 * 2. Finds hardcoded strings that should use translate()
 */

// Configuration
const CONFIG = {
  srcDir: path.join(__dirname, '../../src'),
  templateFile: path.join(__dirname, '../../template.json'),
  excludeDirs: ['node_modules', 'build', 'dist', '.git'],
  excludeFiles: [
    '.spec.ts',
    '.spec.tsx',
    '.test.ts',
    '.test.tsx',
    '.fixture.ts',
    '.fixture.tsx',
  ],
  // Patterns to ignore when detecting missing translations
  ignorePatterns: [
    /^[a-z_]+$/, // variable names like 'user_id'
    /^\d+$/, // pure numbers
    /^[A-Z_]+$/, // constants like 'LOADING'
    /^[a-z]+:[a-z]+/, // API endpoints like 'api:endpoint'
    /\$\{/, // template literals
    /^https?:\/\//, // URLs
    /^\/[a-z]/, // paths
    /^[.]{1,2}\//, // relative paths
    /^\w+\.\w+/, // property access
    /^[a-z]+\([^)]*\)$/, // function calls
  ],
  // Common UI strings that likely need translation
  uiStringPatterns: [
    /^[A-Z][a-z].*[.!?]?$/, // Sentences starting with capital
    /^[A-Z][a-z]+ [a-z]/, // Multi-word phrases
  ],
  minStringLength: 3,
  maxStringLength: 200,
};

class TranslationAnalyzer {
  constructor() {
    this.usedTranslations = new Set();
    this.potentialMissing = new Map(); // string -> {files: Set, contexts: Array}
    this.allTsFiles = [];
  }

  // Get all TypeScript files recursively
  getAllTSFiles(dirPath, arrayOfFiles = []) {
    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
      const fullPath = path.join(dirPath, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        if (
          !CONFIG.excludeDirs.some((excludeDir) =>
            fullPath.includes(excludeDir),
          )
        ) {
          this.getAllTSFiles(fullPath, arrayOfFiles);
        }
      } else if (
        (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) &&
        !CONFIG.excludeFiles.some((pattern) => fullPath.includes(pattern))
      ) {
        arrayOfFiles.push(fullPath);
      }
    });

    return arrayOfFiles;
  }

  // Extract used translation keys from translate() calls
  extractUsedTranslations(node, filePath) {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'translate' &&
      node.arguments.length > 0
    ) {
      const firstArg = node.arguments[0];
      let translationKey = null;

      if (ts.isStringLiteral(firstArg)) {
        translationKey = firstArg.text;
      } else if (ts.isBinaryExpression(firstArg)) {
        translationKey = this.extractStringFromBinaryExpression(firstArg);
      }

      if (translationKey) {
        this.usedTranslations.add(translationKey);
      }
    }

    ts.forEachChild(node, (childNode) =>
      this.extractUsedTranslations(childNode, filePath),
    );
  }

  // Extract string from binary expressions (string concatenation)
  extractStringFromBinaryExpression(node) {
    const left = node.left;
    const right = node.right;
    let leftString = null;
    let rightString = null;

    if (ts.isStringLiteral(left)) {
      leftString = left.text;
    } else if (ts.isBinaryExpression(left)) {
      leftString = this.extractStringFromBinaryExpression(left);
    }

    if (ts.isStringLiteral(right)) {
      rightString = right.text;
    } else if (ts.isBinaryExpression(right)) {
      rightString = this.extractStringFromBinaryExpression(right);
    }

    if (leftString !== null && rightString !== null) {
      return leftString + rightString;
    } else if (leftString !== null) {
      return leftString;
    } else if (rightString !== null) {
      return rightString;
    }

    return null;
  }

  // Find hardcoded strings that might need translation
  findPotentialMissingTranslations(node, filePath) {
    if (ts.isStringLiteral(node)) {
      const text = node.text.trim();

      // Skip if string is too short/long or matches ignore patterns
      if (
        text.length < CONFIG.minStringLength ||
        text.length > CONFIG.maxStringLength ||
        CONFIG.ignorePatterns.some((pattern) => pattern.test(text))
      ) {
        return;
      }

      // Check if it looks like UI text
      const looksLikeUIText = CONFIG.uiStringPatterns.some((pattern) =>
        pattern.test(text),
      );
      const hasSpaces = text.includes(' ');
      const startsWithCapital = /^[A-Z]/.test(text);

      if (looksLikeUIText || (hasSpaces && startsWithCapital)) {
        // Get some context around the string
        const sourceFile = node.getSourceFile();
        const start = node.getStart();
        const line = sourceFile.getLineAndCharacterOfPosition(start).line + 1;
        const context = this.getStringContext(node);

        if (!this.potentialMissing.has(text)) {
          this.potentialMissing.set(text, { files: new Set(), contexts: [] });
        }

        const relativeFilePath = path.relative(CONFIG.srcDir, filePath);
        this.potentialMissing
          .get(text)
          .files.add(`${relativeFilePath}:${line}`);
        this.potentialMissing.get(text).contexts.push(context);
      }
    }

    ts.forEachChild(node, (childNode) =>
      this.findPotentialMissingTranslations(childNode, filePath),
    );
  }

  // Get context around a string literal
  getStringContext(node) {
    let parent = node.parent;

    // Try to get meaningful context
    if (ts.isPropertyAssignment(parent)) {
      return `property: ${parent.name.getText()}`;
    } else if (ts.isCallExpression(parent)) {
      const expr = parent.expression;
      if (ts.isIdentifier(expr)) {
        return `function: ${expr.text}()`;
      } else if (ts.isPropertyAccessExpression(expr)) {
        return `method: ${expr.name.text}()`;
      }
    } else if (ts.isJsxAttribute(parent)) {
      return `JSX attribute: ${parent.name.text}`;
    } else if (ts.isJsxText(parent) || ts.isJsxExpression(parent)) {
      return 'JSX content';
    }

    return 'unknown context';
  }

  // Process a single file
  processFile(filePath) {
    try {
      const sourceCode = fs.readFileSync(filePath, 'utf8');
      const sourceFile = ts.createSourceFile(
        filePath,
        sourceCode,
        ts.ScriptTarget.Latest,
        true,
      );

      // Extract used translations
      this.extractUsedTranslations(sourceFile, filePath);

      // Find potential missing translations
      this.findPotentialMissingTranslations(sourceFile, filePath);
    } catch (error) {
      console.warn(
        `Warning: Could not process file ${filePath}: ${error.message}`,
      );
    }
  }

  // Load template.json
  loadTemplate() {
    try {
      const templateContent = fs.readFileSync(CONFIG.templateFile, 'utf8');
      return JSON.parse(templateContent);
    } catch (error) {
      console.error(`Error loading template file: ${error.message}`);
      return {};
    }
  }

  // Load all locale files
  loadLocales() {
    const localesDir = path.join(__dirname, '../');
    const locales = {};

    try {
      const localeFiles = fs
        .readdirSync(localesDir)
        .filter((file) => file.endsWith('.json'));

      for (const file of localeFiles) {
        const locale = file.replace('.json', '');
        const filePath = path.join(localesDir, file);

        try {
          const content = fs.readFileSync(filePath, 'utf8');
          locales[locale] = JSON.parse(content);
        } catch (error) {
          console.warn(
            `Warning: Could not load locale file ${file}: ${error.message}`,
          );
          locales[locale] = {};
        }
      }
    } catch (error) {
      console.warn(
        `Warning: Could not read locales directory: ${error.message}`,
      );
    }

    return locales;
  }

  // Analyze locale coverage
  analyzeLocales(template, usedTranslations, filterLocale = null) {
    const allLocales = this.loadLocales();
    const locales = filterLocale
      ? { [filterLocale]: allLocales[filterLocale] }
      : allLocales;

    if (filterLocale && !locales[filterLocale]) {
      console.warn(
        `⚠️  Language '${filterLocale}' not found. Available languages: ${Object.keys(allLocales).join(', ')}`,
      );
      return {};
    }

    const analysis = {};
    const usedKeys = [...usedTranslations];
    const allTemplateKeys = Object.keys(template);

    for (const [locale, translations] of Object.entries(locales)) {
      const localeKeys = new Set(Object.keys(translations));

      // Find missing translations (keys that should be translated but aren't)
      const missingInLocale = usedKeys.filter((key) => !localeKeys.has(key));

      // Find deprecated translations (keys in locale but not used in code)
      const deprecatedInLocale = [...localeKeys].filter(
        (key) => !usedTranslations.has(key),
      );

      // Find template keys not in locale (may be unused but in template)
      const templateNotInLocale = allTemplateKeys.filter(
        (key) => !localeKeys.has(key),
      );

      // Find empty/null translations
      const emptyTranslations = [...localeKeys].filter((key) => {
        const value = translations[key];
        return !value || value.trim() === '';
      });

      analysis[locale] = {
        totalKeys: localeKeys.size,
        missingKeys: missingInLocale,
        deprecatedKeys: deprecatedInLocale,
        templateNotInLocale: templateNotInLocale,
        emptyTranslations: emptyTranslations,
        coverage:
          usedKeys.length > 0
            ? ((usedKeys.length - missingInLocale.length) / usedKeys.length) *
              100
            : 100,
      };
    }

    return analysis;
  }

  // Main analysis function
  analyze(filterLocale = null) {
    const localeFilter = filterLocale ? ` for language '${filterLocale}'` : '';
    console.log(`🔍 Starting translation analysis${localeFilter}...\n`);

    // Get all TypeScript files
    this.allTsFiles = this.getAllTSFiles(CONFIG.srcDir);
    console.log(`📁 Found ${this.allTsFiles.length} TypeScript files\n`);

    // Process all files
    this.allTsFiles.forEach((filePath) => this.processFile(filePath));

    // Load template
    const template = this.loadTemplate();
    const allTemplateKeys = new Set(Object.keys(template));

    console.log(
      `📋 Template contains ${allTemplateKeys.size} translation keys`,
    );
    console.log(
      `✅ Found ${this.usedTranslations.size} used translation keys\n`,
    );

    // Find unused translations
    const unusedTranslations = new Set(
      [...allTemplateKeys].filter((key) => !this.usedTranslations.has(key)),
    );

    // Analyze locales (with optional filter)
    const localeAnalysis = this.analyzeLocales(
      template,
      this.usedTranslations,
      filterLocale,
    );

    // Generate reports
    if (!filterLocale) {
      this.generateUnusedReport(unusedTranslations, template);
      this.generateMissingReport();
    }
    this.generateLocaleReport(localeAnalysis);
    this.generateSummary(
      allTemplateKeys.size,
      this.usedTranslations.size,
      unusedTranslations.size,
      localeAnalysis,
    );
  }

  // Generate unused translations report
  generateUnusedReport(unusedTranslations, template) {
    if (unusedTranslations.size === 0) {
      console.log('✅ No unused translations found!\n');
      return;
    }

    console.log(`⚠️  UNUSED TRANSLATIONS (${unusedTranslations.size} found):`);
    console.log('='.repeat(50));

    const sortedUnused = [...unusedTranslations].sort();
    sortedUnused.forEach((key) => {
      const entry = template[key];
      console.log(`🗑️  "${key}"`);
      if (entry && entry.description) {
        console.log(`   Last seen in: ${entry.description}`);
      }
      console.log('');
    });
  }

  // Generate missing translations report
  generateMissingReport() {
    if (this.potentialMissing.size === 0) {
      console.log('✅ No potential missing translations found!\n');
      return;
    }

    console.log(
      `🚨 POTENTIAL MISSING TRANSLATIONS (${this.potentialMissing.size} found):`,
    );
    console.log('='.repeat(50));

    const sortedMissing = [...this.potentialMissing.entries()].sort(
      ([a], [b]) => a.localeCompare(b),
    );

    sortedMissing.forEach(([text, data]) => {
      console.log(`🔤 "${text}"`);
      console.log(`   Found in: ${[...data.files].join(', ')}`);
      if (data.contexts.length > 0) {
        const uniqueContexts = [...new Set(data.contexts)];
        console.log(`   Context: ${uniqueContexts.join(', ')}`);
      }
      console.log('');
    });
  }

  // Generate locale analysis report
  generateLocaleReport(localeAnalysis) {
    const locales = Object.keys(localeAnalysis);

    if (locales.length === 0) {
      console.log('⚠️  No locale files found in /locales directory\n');
      return;
    }

    console.log(`🌍 LOCALE ANALYSIS (${locales.length} languages):`);
    console.log('='.repeat(50));

    // Summary table
    console.log('Language Coverage Summary:');
    console.log(
      '┌─────────┬─────────┬─────────┬─────────┬─────────┬─────────┐',
    );
    console.log(
      '│ Locale  │  Total  │ Missing │ Deprecated│  Empty  │Coverage │',
    );
    console.log(
      '├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤',
    );

    for (const [locale, analysis] of Object.entries(localeAnalysis)) {
      const coverage = `${analysis.coverage.toFixed(1)}%`;
      console.log(
        `│ ${locale.padEnd(7)} │ ${String(analysis.totalKeys).padStart(7)} │ ${String(analysis.missingKeys.length).padStart(7)} │ ${String(analysis.deprecatedKeys.length).padStart(9)} │ ${String(analysis.emptyTranslations.length).padStart(7)} │ ${coverage.padStart(7)} │`,
      );
    }
    console.log(
      '└─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘\n',
    );

    // Detailed analysis for languages with issues
    const problemLocales = Object.entries(localeAnalysis).filter(
      ([_, analysis]) =>
        analysis.missingKeys.length > 0 ||
        analysis.deprecatedKeys.length > 10 ||
        analysis.emptyTranslations.length > 0,
    );

    if (problemLocales.length > 0) {
      console.log('🔍 Detailed Issues:');
      console.log('-'.repeat(30));

      for (const [locale, analysis] of problemLocales) {
        console.log(`\n📍 ${locale.toUpperCase()}:`);

        if (analysis.missingKeys.length > 0) {
          console.log(
            `  ❌ Missing ${analysis.missingKeys.length} required translations`,
          );
          if (analysis.missingKeys.length <= 10) {
            analysis.missingKeys.forEach((key) => console.log(`     "${key}"`));
          } else {
            analysis.missingKeys
              .slice(0, 5)
              .forEach((key) => console.log(`     "${key}"`));
            console.log(`     ... and ${analysis.missingKeys.length - 5} more`);
          }
        }

        if (analysis.deprecatedKeys.length > 10) {
          console.log(
            `  🗑️  ${analysis.deprecatedKeys.length} deprecated translations (consider cleanup)`,
          );
        }

        if (analysis.emptyTranslations.length > 0) {
          console.log(
            `  📝 ${analysis.emptyTranslations.length} empty translations need content`,
          );
          if (analysis.emptyTranslations.length <= 5) {
            analysis.emptyTranslations.forEach((key) =>
              console.log(`     "${key}"`),
            );
          } else {
            analysis.emptyTranslations
              .slice(0, 3)
              .forEach((key) => console.log(`     "${key}"`));
            console.log(
              `     ... and ${analysis.emptyTranslations.length - 3} more`,
            );
          }
        }
      }
    }
    console.log('');
  }

  // Generate summary
  generateSummary(totalKeys, usedKeys, unusedKeys, localeAnalysis) {
    console.log('📊 SUMMARY:');
    console.log('='.repeat(30));
    console.log(`Total translation keys: ${totalKeys}`);
    console.log(`Used translation keys: ${usedKeys}`);
    console.log(`Unused translation keys: ${unusedKeys}`);
    console.log(
      `Potential missing translations: ${this.potentialMissing.size}`,
    );
    console.log(`Usage rate: ${((usedKeys / totalKeys) * 100).toFixed(1)}%`);

    if (localeAnalysis && Object.keys(localeAnalysis).length > 0) {
      const locales = Object.values(localeAnalysis);
      const avgCoverage =
        locales.reduce((sum, l) => sum + l.coverage, 0) / locales.length;
      const totalMissing = locales.reduce(
        (sum, l) => sum + l.missingKeys.length,
        0,
      );
      const totalDeprecated = locales.reduce(
        (sum, l) => sum + l.deprecatedKeys.length,
        0,
      );
      const totalEmpty = locales.reduce(
        (sum, l) => sum + l.emptyTranslations.length,
        0,
      );

      console.log(`\nLocale Statistics:`);
      console.log(`Languages: ${locales.length}`);
      console.log(`Average coverage: ${avgCoverage.toFixed(1)}%`);
      console.log(`Total missing translations: ${totalMissing}`);
      console.log(`Total deprecated translations: ${totalDeprecated}`);
      console.log(`Total empty translations: ${totalEmpty}`);
    }
  }
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);

  // Parse command line arguments
  const options = {
    dryRun: args.includes('--dry-run') || args.includes('-n'),
    localesOnly: args.includes('--locales-only'),
    templateOnly: args.includes('--template-only'),
    summary: args.includes('--summary'),
    help: args.includes('--help') || args.includes('-h'),
    language: null,
  };

  // Parse --language or --lang option
  const langIndex = args.findIndex(
    (arg) => arg === '--language' || arg === '--lang',
  );
  if (langIndex !== -1 && langIndex + 1 < args.length) {
    options.language = args[langIndex + 1];
  }

  if (options.help) {
    console.log(`
Translation Analysis Tool

Usage: node checkTranslations.cjs [options]

Options:
  --dry-run, -n          Show summary without detailed output
  --locales-only         Only analyze locale files, skip template analysis
  --template-only        Only analyze template usage, skip locale analysis
  --summary              Show only summary statistics
  --language <code>      Filter analysis to specific language (e.g., --language ru)
  --lang <code>          Alias for --language
  --help, -h             Show this help message

Examples:
  node checkTranslations.cjs --dry-run
  node checkTranslations.cjs --locales-only
  node checkTranslations.cjs --language ru
  node checkTranslations.cjs --lang et --summary
    `);
    process.exit(0);
  }

  const analyzer = new TranslationAnalyzer();

  if (options.dryRun || options.summary) {
    // Override report methods to show only summaries

    analyzer.generateUnusedReport = function (unusedTranslations) {
      if (unusedTranslations.size > 0) {
        console.log(
          `⚠️  Found ${unusedTranslations.size} unused translations in template.json\n`,
        );
      } else {
        console.log('✅ No unused translations found in template.json\n');
      }
    };

    analyzer.generateMissingReport = function () {
      if (this.potentialMissing.size > 0) {
        console.log(
          `🚨 Found ${this.potentialMissing.size} potential missing translations in codebase\n`,
        );
      } else {
        console.log('✅ No missing translations detected in codebase\n');
      }
    };

    analyzer.generateLocaleReport = function (localeAnalysis) {
      const locales = Object.keys(localeAnalysis);

      if (locales.length === 0) {
        console.log('⚠️  No locale files found\n');
        return;
      }

      console.log(`🌍 LOCALE SUMMARY (${locales.length} languages):`);
      console.log('='.repeat(40));

      for (const [locale, analysis] of Object.entries(localeAnalysis)) {
        const status =
          analysis.coverage >= 95
            ? '✅'
            : analysis.coverage >= 80
              ? '⚠️ '
              : '❌';
        console.log(
          `${status} ${locale}: ${analysis.coverage.toFixed(1)}% coverage (${analysis.missingKeys.length} missing, ${analysis.deprecatedKeys.length} deprecated, ${analysis.emptyTranslations.length} empty)`,
        );
      }
      console.log('');
    };
  }

  if (options.localesOnly) {
    // Only analyze locales
    const modeFilter = options.language
      ? ` for language '${options.language}'`
      : '';
    console.log(`🔍 Analyzing locale files only${modeFilter}...\n`);
    const template = analyzer.loadTemplate();

    // We still need to find used translations for accurate locale analysis
    analyzer.allTsFiles = analyzer.getAllTSFiles(CONFIG.srcDir);
    analyzer.allTsFiles.forEach((filePath) => analyzer.processFile(filePath));

    const localeAnalysis = analyzer.analyzeLocales(
      template,
      analyzer.usedTranslations,
      options.language,
    );
    analyzer.generateLocaleReport(localeAnalysis);

    const locales = Object.values(localeAnalysis);
    if (locales.length > 0) {
      const avgCoverage =
        locales.reduce((sum, l) => sum + l.coverage, 0) / locales.length;
      const totalMissing = locales.reduce(
        (sum, l) => sum + l.missingKeys.length,
        0,
      );
      const totalDeprecated = locales.reduce(
        (sum, l) => sum + l.deprecatedKeys.length,
        0,
      );

      console.log('📊 LOCALE SUMMARY:');
      console.log(`Average coverage: ${avgCoverage.toFixed(1)}%`);
      console.log(`Total missing: ${totalMissing}`);
      console.log(`Total deprecated: ${totalDeprecated}`);
    }
  } else if (options.templateOnly) {
    // Only analyze template vs codebase (language filter doesn't apply here)
    console.log('🔍 Analyzing template usage only...\n');
    analyzer.allTsFiles = analyzer.getAllTSFiles(CONFIG.srcDir);
    analyzer.allTsFiles.forEach((filePath) => analyzer.processFile(filePath));

    const template = analyzer.loadTemplate();
    const allTemplateKeys = new Set(Object.keys(template));
    const unusedTranslations = new Set(
      [...allTemplateKeys].filter((key) => !analyzer.usedTranslations.has(key)),
    );

    analyzer.generateUnusedReport(unusedTranslations, template);
    analyzer.generateMissingReport();
    analyzer.generateSummary(
      allTemplateKeys.size,
      analyzer.usedTranslations.size,
      unusedTranslations.size,
    );
  } else {
    // Full analysis (with optional language filter)
    analyzer.analyze(options.language);
  }
}

module.exports = TranslationAnalyzer;
