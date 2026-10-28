#!/usr/bin/env node
/**
 * Audit harness for detecting dead/unused CSS variables and undeclared ghost tokens.
 *
 * Checks:
 *   1. Dead tokens: Custom properties declared in `packages/design-tokens/src/css/*.css`
 *      that have zero call sites in consumer code (and are not in the documented allowlist).
 *   2. Stale allowlist: Exemptions in the allowlist that have gained call sites and should be pruned.
 *   3. Ghost tokens: `var(--token)` or `getCssVar('--token')` references in application code
 *      that have no declaration in any stylesheet or known runtime provider.
 *
 * Usage:
 *   node packages/design-tokens/scripts/audit-tokens.mjs              audit tokens (exit 1 on error)
 *   node packages/design-tokens/scripts/audit-tokens.mjs --verbose    list all tokens and hit counts
 *   node packages/design-tokens/scripts/audit-tokens.mjs --duplicates list duplicate semantic tokens
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const repoRoot = path.resolve(here, '../../..');

export const TOKENS_DIR = path.join(repoRoot, 'packages/design-tokens/src/css');

/**
 * Documented exemptions for tokens that form complete, intentional semantic contracts
 * (e.g. symmetrical role matrices) even if currently pending adoption at call sites.
 */
export const ALLOWLIST = {
  // Symmetrical semantic role slots preserved for semantic contract completeness
  '--fg-brand-secondary':
    'Symmetrical semantic foreground role: brand secondary foreground slot paired with --fg-brand-primary',
  // Root Tailwind typography token implicitly consumed by Tailwind engine/preflight
  '--font-sans':
    'Tailwind root font-family token bridging runtime --font-family into Tailwind theme utilities and base styling',
  // Root Tailwind theme overrides implicitly consumed by Tailwind engine/preflight
  '--text-xs--line-height':
    'Tailwind implicit line-height modifier for text-xs',
  '--text-sm--line-height':
    'Tailwind implicit line-height modifier for text-sm',
  '--text-base--line-height':
    'Tailwind implicit line-height modifier for text-base',
  '--text-lg--line-height':
    'Tailwind implicit line-height modifier for text-lg',
  '--text-xl--line-height':
    'Tailwind implicit line-height modifier for text-xl',
  '--text-2xl--line-height':
    'Tailwind implicit line-height modifier for text-2xl',
  '--text-3xl--line-height':
    'Tailwind implicit line-height modifier for text-3xl',
  '--text-4xl--line-height':
    'Tailwind implicit line-height modifier for text-4xl',
};

/**
 * Recognized external, runtime-injected, or third-party CSS custom properties
 * that do not come from static stylesheets.
 */
export const KNOWN_RUNTIME_PREFIXES = [
  '--brand-', // Runtime-injected brand ramp (initBrandTokens)
  '--font-', // Runtime-injected typography (initFontFamily)
  '--radix-', // Radix UI dynamic animation/presence properties
  '--bs-', // Bootstrap legacy variables (guarded by ESLint no-bootstrap-css-vars)
  '--kt-', // Metronic layout dimensions
  '--test-', // Mock variables in unit tests
  '--boot-', // Boot splash text and logo, set at runtime by waldur-boot-splash's boot-splash.js
];

const CONSUMER_DIRS = ['src', 'packages', 'apps'];
const IGNORE_PATTERNS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  '.system_generated',
  'storybook-static',
  'scripts', // Exclude generator/audit scripts from being counted as consumers
];

const SCAN_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.css',
  '.scss',
  '.html',
]);

/**
 * Recursively collects consumer files across application source directories.
 */
export function getConsumerFiles(root = repoRoot) {
  const fileList = [];

  function walk(dir) {
    for (const item of readdirSync(dir)) {
      if (IGNORE_PATTERNS.some((pat) => item === pat || item.startsWith('.')))
        continue;
      const fullPath = path.join(dir, item);
      const st = statSync(fullPath);
      if (st.isDirectory()) {
        walk(fullPath);
      } else {
        const ext = path.extname(item);
        if (SCAN_EXTENSIONS.has(ext)) {
          fileList.push(fullPath);
        }
      }
    }
  }

  for (const dirName of CONSUMER_DIRS) {
    const full = path.join(root, dirName);
    try {
      if (statSync(full).isDirectory()) walk(full);
    } catch {
      // Directory doesn't exist
    }
  }

  return fileList;
}

/**
 * Directories under src/css that hold Tailwind wiring rather than design
 * tokens: tailwind/theme.css declares Tailwind theme keys
 * (`--text-color-secondary: var(--text-secondary)`), which no code reads with
 * var() and which are aliases by design, so the token audits skip them.
 */
const NON_TOKEN_DIRS = new Set(['tailwind']);

function getAllCssFiles(dir) {
  const files = [];
  function walk(current) {
    for (const item of readdirSync(current)) {
      const full = path.join(current, item);
      if (statSync(full).isDirectory()) {
        if (current === dir && NON_TOKEN_DIRS.has(item)) continue;
        walk(full);
      } else if (item.endsWith('.css')) {
        files.push(path.relative(dir, full));
      }
    }
  }
  walk(dir);
  return files;
}

/**
 * Collects all custom properties declared across the CSS layer subdirectories.
 */
export function getDeclaredTokens(tokensDir = TOKENS_DIR) {
  const declared = new Map(); // tokenName -> { file, themeType?: 'z' | 'color' | 'animate' }

  for (const file of getAllCssFiles(tokensDir)) {
    const content = readFileSync(path.join(tokensDir, file), 'utf8');
    for (const m of content.matchAll(/(?:^|[{;\s])(--[a-zA-Z0-9_-]+)\s*:/g)) {
      const name = m[1];
      if (!declared.has(name)) {
        let themeType = null;
        if (name.startsWith('--z-index-')) themeType = 'z';
        else if (name.startsWith('--color-')) themeType = 'color';
        else if (name.startsWith('--animate-')) themeType = 'animate';
        else if (name.startsWith('--radius-')) themeType = 'radius';
        else if (name.startsWith('--breakpoint-')) themeType = 'breakpoint';
        else if (name.startsWith('--text-') && !name.includes('--line-height'))
          themeType = 'text';
        declared.set(name, { file, themeType });
      }
    }
  }

  return declared;
}

/**
 * Audits all declared design tokens for usage across the codebase.
 */
export function auditDesignTokens(options = {}) {
  const root = options.repoRoot || repoRoot;
  const tokensDir = options.tokensDir || TOKENS_DIR;
  const allowlist = options.allowlist || ALLOWLIST;

  const declared = getDeclaredTokens(tokensDir);
  const consumerFiles = getConsumerFiles(root);

  const usageMap = new Map();
  for (const name of declared.keys()) {
    usageMap.set(name, []);
  }

  // Pre-load file contents for maximum speed
  const fileContents = consumerFiles.map((file) => ({
    file,
    relPath: path.relative(root, file),
    content: readFileSync(file, 'utf8'),
  }));

  for (const { file, relPath, content } of fileContents) {
    const isTokenCss = file.startsWith(tokensDir);

    for (const [name, meta] of declared.entries()) {
      let isUsed = false;

      // 1. Direct variable reference: var(--token) or getCssVar('--token') or '--token'
      if (content.includes(name)) {
        const re =
          meta.regex ||
          (meta.regex = new RegExp(
            `${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![a-zA-Z0-9_-])`,
          ));
        if (re.test(content)) {
          if (!isTokenCss) {
            isUsed = true;
          } else if (content.includes(`var(${name})`)) {
            // Token read inside token files (composition)
            isUsed = true;
          }
        }
      }

      // 2. Tailwind @theme utility classes
      if (!isUsed && meta.themeType === 'z') {
        const layer = name.replace('--z-index-', '');
        const zClass = `z-${layer}`;
        if (content.includes(zClass) || content.includes(`'${layer}'`)) {
          isUsed = true;
        }
      }

      if (!isUsed && meta.themeType === 'color') {
        const colorSuffix = name.replace('--color-', '');
        if (
          content.includes(`-${colorSuffix}`) ||
          content.includes(`"${colorSuffix}"`) ||
          content.includes(`'${colorSuffix}'`)
        ) {
          isUsed = true;
        }
      }

      if (!isUsed && meta.themeType === 'radius') {
        const radiusSuffix = name.replace('--radius-', '');
        const radiusClass = `rounded-${radiusSuffix}`;
        if (content.includes(radiusClass)) {
          isUsed = true;
        }
      }

      if (!isUsed && meta.themeType === 'breakpoint') {
        const bp = name.replace('--breakpoint-', '');
        if (content.includes(`${bp}:`)) {
          isUsed = true;
        }
      }

      if (!isUsed && meta.themeType === 'text') {
        const textSize = name.replace('--text-', '');
        const textClass = `text-${textSize}`;
        if (content.includes(textClass)) {
          isUsed = true;
        }
      }

      if (isUsed) {
        usageMap.get(name).push(relPath);
      }
    }
  }

  const deadTokens = [];
  const staleAllowlist = [];

  for (const [name, callers] of usageMap.entries()) {
    const isExempt = Boolean(allowlist[name]);
    if (callers.length === 0) {
      if (!isExempt) {
        deadTokens.push({ name, file: declared.get(name).file });
      }
    } else {
      if (isExempt) {
        staleAllowlist.push({ name, callers: callers.length });
      }
    }
  }

  return {
    totalDeclared: declared.size,
    usedTokens:
      declared.size - deadTokens.length - Object.keys(allowlist).length,
    deadTokens,
    staleAllowlist,
    usageMap,
  };
}

/**
 * Audits consumer code for references to ghost tokens (never declared anywhere).
 */
export function auditGhostTokens(options = {}) {
  const root = options.repoRoot || repoRoot;
  const consumerFiles = getConsumerFiles(root);

  // 1. Find all declared variables in any CSS/SCSS file or inline style / arbitrary property
  const allDeclared = new Set();
  for (const file of consumerFiles) {
    const content = readFileSync(file, 'utf8');

    // Static stylesheet declarations: --var-name:
    if (file.endsWith('.css') || file.endsWith('.scss')) {
      for (const m of content.matchAll(/(?:^|[{;\s])(--[a-zA-Z0-9_-]+)\s*:/g)) {
        allDeclared.add(m[1]);
      }
    }

    // Inline style / arbitrary property declarations in TSX: style={{ '--foo': ... }} or [--foo:...]
    for (const m of content.matchAll(/\[(--[a-zA-Z0-9_-]+):/g)) {
      allDeclared.add(m[1]);
    }
    for (const m of content.matchAll(/['"](--[a-zA-Z0-9_-]+)['"]\s*:/g)) {
      allDeclared.add(m[1]);
    }
  }

  // 2. Scan for references in application code
  const ghosts = new Map(); // tokenName -> callers[]

  for (const file of consumerFiles) {
    // Skip test files, mock fixtures, and third-party vendor stylesheets
    if (
      file.includes('.test.') ||
      file.includes('.stories.') ||
      file.includes('MarkdownEditor.scss')
    ) {
      continue;
    }

    const rawContent = readFileSync(file, 'utf8');
    const content = rawContent
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/(^|[^:])\/\/.*$/gm, '$1');
    const relPath = path.relative(root, file);

    // A name that runs into a Sass interpolation (var(--color-#{$ramp}-…))
    // is computed at compile time, so it cannot be checked here.
    const matches = [
      ...content.matchAll(/var\(\s*(--[a-zA-Z0-9_-]+)(?![\w#-])/g),
      ...content.matchAll(/getCssVar\(\s*['"](--[a-zA-Z0-9_-]+)['"]/g),
    ];

    for (const m of matches) {
      const varName = m[1];
      if (allDeclared.has(varName)) continue;
      if (KNOWN_RUNTIME_PREFIXES.some((prefix) => varName.startsWith(prefix)))
        continue;

      if (!ghosts.has(varName)) ghosts.set(varName, []);
      ghosts.get(varName).push(relPath);
    }
  }

  return Array.from(ghosts.entries()).map(([name, callers]) => ({
    name,
    callers,
  }));
}

/**
 * Primitive / scale prefix targets that tokens are permitted to compose from.
 */
export const ALLOWED_COMPOSITION_PREFIXES = [
  '--color-', // Core color ramps
  '--brand-', // Runtime brand ramp
  '--font-', // Runtime typography
  '--z-index-', // Z-index scale
  '--animate-', // Animation tokens
];

/**
 * The layer a token file belongs to, from its directory under TOKENS_DIR.
 */
const layerOf = (file) => file.split(path.sep)[0];

/**
 * Names of every token declared in the semantic layer.
 */
function getSemanticTokenNames(tokensDir = TOKENS_DIR) {
  const names = new Set();
  for (const file of getAllCssFiles(tokensDir)) {
    if (layerOf(file) !== 'semantic') continue;
    const content = readFileSync(path.join(tokensDir, file), 'utf8');
    for (const m of content.matchAll(/(?:^|[{;\s])(--[a-zA-Z0-9_-]+)\s*:/g)) {
      names.add(m[1]);
    }
  }
  return names;
}

/**
 * Audits design tokens for redundant / chained aliases (multi-level indirection).
 *
 * Each layer takes one hop down, never sideways:
 *   - primitives and semantic tokens bind to primitive scales (--color-*,
 *     --brand-*, ...), never to another domain's token;
 *   - component tokens bind to semantic tokens, never to another
 *     component's token. (Binding a component token straight to a primitive
 *     is reported by auditComponentLayer instead.)
 * So a value resolves in at most two hops: component -> semantic -> primitive.
 */
export function auditRedundantAliases(tokensDir = TOKENS_DIR) {
  const redundant = []; // { file, token, target }
  const semantic = getSemanticTokenNames(tokensDir);
  for (const file of getAllCssFiles(tokensDir)) {
    const content = readFileSync(path.join(tokensDir, file), 'utf8');

    for (const m of content.matchAll(
      /(?:^|[{;\s])(--[a-zA-Z0-9_-]+)\s*:\s*var\((--[a-zA-Z0-9_-]+)[^)]*\)\s*;/g,
    )) {
      const token = m[1];
      const target = m[2];

      // Primitive scales and runtime properties are valid one-hop composition
      if (ALLOWED_COMPOSITION_PREFIXES.some((p) => target.startsWith(p)))
        continue;

      // Allow same-component internal state composition (e.g. --btn-* referencing another --btn-*)
      const tokenDomain = token.split('-')[2];
      const targetDomain = target.split('-')[2];
      if (tokenDomain && tokenDomain === targetDomain) continue;

      // Component tokens are expected to bind to semantic roles.
      if (layerOf(file) === 'components' && semantic.has(target)) continue;

      redundant.push({ file, token, target });
    }
  }

  return redundant;
}

/**
 * Component token files not yet converted to the component-layer rule.
 * Remove a file once auditComponentLayer reports nothing for it; the list
 * only shrinks.
 */
export const COMPONENT_LAYER_RATCHET = [
  'components/button.css',
  'components/card.css',
  'components/dialog.css',
  'components/progress.css',
  'components/sheet.css',
  'components/sidebar.css',
];

const RAW_COLOUR = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|color-mix)\(/;
const PRIMITIVE_COLOUR = /var\(--(?:color|brand)-[a-zA-Z0-9-]+\)/;

/**
 * Audits the component layer (components/*.css). Component tokens leave
 * dark mode to the semantic layer:
 *   - no `data-theme` selector: a component token's value is the same
 *     declaration in both themes, and switches because the semantic token it
 *     reads does;
 *   - no colour from below the semantic layer: no `var(--color-*)`,
 *     `var(--brand-*)`, hex, rgb() or color-mix() in a component token.
 * Blocks keyed on `data-sidebar-style` are exempt: the sidebar styles are
 * fixed looks that must not follow the theme, so they read primitives.
 * Non-colour values (sizes, `none`, `transparent`) are not checked.
 */
export function auditComponentLayer(tokensDir = TOKENS_DIR) {
  const violations = []; // { file, token?, selector, reason }
  for (const file of getAllCssFiles(tokensDir)) {
    if (layerOf(file) !== 'components' || file.endsWith('index.css')) continue;
    const content = readFileSync(path.join(tokensDir, file), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/@import\s+[^;]+;/g, '');
    for (const [, rawSelector, body] of content.matchAll(
      /([^{}]+)\{([^{}]*)\}/g,
    )) {
      const selector = rawSelector.trim();
      if (selector.includes('data-sidebar-style')) continue;
      if (selector.includes('data-theme')) {
        violations.push({ file, selector, reason: 'theme-scoped selector' });
        continue;
      }
      for (const m of body.matchAll(/(--[a-zA-Z0-9_-]+)\s*:\s*([^;]+);/g)) {
        const value = m[2].trim();
        if (PRIMITIVE_COLOUR.test(value) || RAW_COLOUR.test(value)) {
          violations.push({
            file,
            token: m[1],
            selector,
            reason: `colour below the semantic layer: ${value.replace(/\s+/g, ' ')}`,
          });
        }
      }
    }
  }
  const failing = new Set(violations.map((v) => v.file));
  return {
    violations: violations.filter(
      (v) => !COMPONENT_LAYER_RATCHET.includes(v.file),
    ),
    staleRatchet: COMPONENT_LAYER_RATCHET.filter((f) => !failing.has(f)),
  };
}

/**
 * Audits semantic design tokens (Layer 2: packages/design-tokens/src/css/semantic/*.css)
 * for duplicates:
 *   1. Duplicate declarations (name collisions): Tokens declared across multiple stylesheets
 *      or declared multiple times within the same selector block.
 *   2. Duplicate value profiles: Tokens that resolve to the exact same values across light
 *      and dark themes (e.g. --border-divider-strong and --text-quinary).
 */
export function auditDuplicateSemanticTokens(options = {}) {
  const tokensDir = options.tokensDir || TOKENS_DIR;
  const semanticDir = options.semanticDir || path.join(tokensDir, 'semantic');

  const files = readdirSync(semanticDir).filter(
    (f) => f.endsWith('.css') && f !== 'index.css',
  );

  const tokenMap = new Map(); // tokenName -> { name, file, light: null, dark: null }
  const duplicateDeclarations = [];
  const declTracker = new Map(); // tokenName -> Set(file::selector)

  for (const file of files) {
    const raw = readFileSync(path.join(semanticDir, file), 'utf8');
    const content = raw
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/@import\s+[^;]+;/g, '');
    const blocks = [...content.matchAll(/([^{}]+)\{([^{}]*)\}/g)];

    for (const block of blocks) {
      const selector = block[1].trim();
      const body = block[2];
      const isDark =
        selector.includes('data-theme') || selector.includes('dark');

      for (const m of body.matchAll(
        /(?:^|[{;\s])(--[a-zA-Z0-9_-]+)\s*:\s*([^;]+);/g,
      )) {
        const token = m[1].trim();
        const value = m[2].trim().replace(/\s+/g, ' ');
        const declKey = `${file}::${isDark ? 'dark' : 'light'}`;

        if (!declTracker.has(token)) declTracker.set(token, new Set());
        if (declTracker.get(token).has(declKey)) {
          duplicateDeclarations.push({
            token,
            file,
            selector,
            value,
            reason: 'Duplicate declaration in same selector block',
          });
        }
        declTracker.get(token).add(declKey);

        if (!tokenMap.has(token)) {
          tokenMap.set(token, { name: token, file, light: null, dark: null });
        } else if (tokenMap.get(token).file !== file) {
          duplicateDeclarations.push({
            token,
            file,
            otherFile: tokenMap.get(token).file,
            reason: 'Declared across multiple semantic files',
          });
        }

        const entry = tokenMap.get(token);
        if (isDark) {
          entry.dark = value;
        } else {
          entry.light = value;
        }
      }
    }
  }

  // Tokens without explicit dark mode inherit their light value
  for (const entry of tokenMap.values()) {
    if (entry.dark === null && entry.light !== null) {
      entry.dark = entry.light;
    }
  }

  // Group by light/dark value profile
  const valueGroups = new Map();
  for (const entry of tokenMap.values()) {
    const key = `${entry.light} <=> ${entry.dark}`;
    if (!valueGroups.has(key)) valueGroups.set(key, []);
    valueGroups.get(key).push({ name: entry.name, file: entry.file });
  }

  const duplicateValues = [];
  const sameFileDuplicates = [];
  const crossFileDuplicates = [];

  for (const [profile, tokens] of valueGroups.entries()) {
    if (tokens.length > 1) {
      const filesSet = new Set(tokens.map((t) => t.file));
      const files = Array.from(filesSet);
      const [light, dark] = profile.split(' <=> ');

      // Check intra-file duplicates within this group
      const perFile = new Map();
      for (const t of tokens) {
        if (!perFile.has(t.file)) perFile.set(t.file, []);
        perFile.get(t.file).push(t.name);
      }
      for (const [f, tokenNames] of perFile.entries()) {
        if (tokenNames.length > 1) {
          sameFileDuplicates.push({
            file: f,
            light,
            dark,
            tokens: tokenNames,
          });
        }
      }

      const item = {
        light,
        dark,
        isSameFile: files.length === 1,
        files,
        tokens,
      };
      duplicateValues.push(item);
      if (files.length > 1) {
        crossFileDuplicates.push(item);
      }
    }
  }

  return {
    totalSemanticTokens: tokenMap.size,
    duplicateDeclarations,
    duplicateValues,
    sameFileDuplicates,
    crossFileDuplicates,
  };
}

/**
 * Duplicate value profiles that are deliberate: different roles that happen to
 * resolve to the same colours today and are expected to diverge independently
 * (a surface and a line, a status tint and a neutral fill). Keyed by the
 * group's token names, sorted and joined with ' = '.
 *
 * Any other duplicate group fails the audit: two tokens with the same value in
 * both themes are one role with two names until shown otherwise. Merge them,
 * or add the group here with the reason they must stay separate.
 */
export const DUPLICATE_BASELINE = {
  '--bg-tertiary = --border-tertiary = --status-neutral-bg':
    'Surface fill, hairline and neutral status tint: share gray-100 today, tuned separately',
  '--bg-quaternary = --border-divider':
    'A surface and a drawn line (step connectors, rules) that coincide at gray-200',
  '--border-brand-solid = --fg-brand-primary = --focus-ring-color':
    'Brand border, brand icon and the focus ring: one brand step, three independent roles',
  '--border-divider-strong = --text-quinary':
    'A strong divider line and the faintest text step, both gray-400 today',
  '--border-divider-medium = --text-senary':
    'A line that must show on any surface and the disabled text mark, both gray-300 today',
};

/** The baseline key for a duplicate group. */
export const duplicateGroupKey = (group) =>
  group.tokens
    .map((t) => t.name)
    .sort()
    .join(' = ');

/**
 * Duplicate groups not in DUPLICATE_BASELINE (unexpected), and baseline
 * entries that are no longer a duplicate group (stale, prune them).
 */
export function auditDuplicateBaseline(options = {}) {
  const baseline = options.baseline || DUPLICATE_BASELINE;
  const { duplicateValues } = auditDuplicateSemanticTokens(options);
  const keys = new Set(duplicateValues.map(duplicateGroupKey));
  return {
    unexpected: duplicateValues.filter(
      (g) => !(duplicateGroupKey(g) in baseline),
    ),
    stale: Object.keys(baseline).filter((key) => !keys.has(key)),
  };
}

// CLI execution
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const verbose = process.argv.includes('--verbose');
  const checkDuplicates =
    process.argv.includes('--duplicates') ||
    process.argv.includes('--check-duplicates');
  const results = auditDesignTokens();
  const ghosts = auditGhostTokens();
  const duplicateResults = auditDuplicateSemanticTokens();

  console.log(
    `\nAudited ${results.totalDeclared} design tokens across the repository:`,
  );
  console.log(
    ` - Active / used tokens: ${results.totalDeclared - results.deadTokens.length - Object.keys(ALLOWLIST).length}`,
  );
  console.log(` - Documented exemptions: ${Object.keys(ALLOWLIST).length}`);
  console.log(
    ` - Duplicate semantic value profiles: ${duplicateResults.duplicateValues.length} groups` +
      (checkDuplicates ? '' : ' (run with --duplicates for details)'),
  );

  let failed = false;

  if (results.deadTokens.length > 0) {
    failed = true;
    console.error(
      `\n✖ Dead / unused tokens found (${results.deadTokens.length}):`,
    );
    for (const { name, file } of results.deadTokens) {
      console.error(`   - ${name} (in packages/design-tokens/src/css/${file})`);
    }
  }

  if (results.staleAllowlist.length > 0) {
    failed = true;
    console.error(
      `\n✖ Stale exemptions in ALLOWLIST (these now have call sites; please remove from ALLOWLIST):`,
    );
    for (const { name, callers } of results.staleAllowlist) {
      console.error(`   - ${name} (${callers} references found)`);
    }
  }

  if (ghosts.length > 0) {
    failed = true;
    console.error(
      `\n✖ Ghost tokens referenced in code without definition (${ghosts.length}):`,
    );
    for (const { name, callers } of ghosts) {
      console.error(
        `   - ${name} (in ${callers.slice(0, 3).join(', ')}${callers.length > 3 ? ` +${callers.length - 3} more` : ''})`,
      );
    }
  }

  const redundant = auditRedundantAliases();
  if (redundant.length > 0) {
    failed = true;
    console.error(`\n✖ Redundant token aliases found (${redundant.length}):`);
    for (const { file, token, target } of redundant) {
      console.error(
        `   - ${token} -> ${target} (in packages/design-tokens/src/css/${file})`,
      );
    }
  }

  if (duplicateResults.duplicateDeclarations.length > 0) {
    failed = true;
    console.error(
      `\n✖ Duplicate token name declarations found (${duplicateResults.duplicateDeclarations.length}):`,
    );
    for (const d of duplicateResults.duplicateDeclarations) {
      console.error(
        `   - ${d.token} (${d.reason}: ${d.file}${d.otherFile ? ` and ${d.otherFile}` : ''})`,
      );
    }
  }

  const baselineResults = auditDuplicateBaseline();
  if (baselineResults.unexpected.length > 0) {
    failed = true;
    console.error(
      `\n✖ New duplicate semantic tokens (${baselineResults.unexpected.length}): same value in both themes. Merge them, or add the group to DUPLICATE_BASELINE with a reason:`,
    );
    for (const g of baselineResults.unexpected) {
      console.error(
        `   - ${duplicateGroupKey(g)} (light: ${g.light}, dark: ${g.dark})`,
      );
    }
  }
  if (baselineResults.stale.length > 0) {
    failed = true;
    console.error(
      `\n✖ Stale DUPLICATE_BASELINE entries (no longer duplicates; remove them):`,
    );
    for (const key of baselineResults.stale) {
      console.error(`   - ${key}`);
    }
  }

  if (checkDuplicates) {
    console.log(
      `\nSemantic token value equivalence analysis (${duplicateResults.duplicateValues.length} duplicate groups):`,
    );
    if (duplicateResults.sameFileDuplicates.length > 0) {
      console.log(`\n  Intra-file duplicate tokens (redundancy candidates):`);
      for (const d of duplicateResults.sameFileDuplicates) {
        console.log(
          `   - ${d.file}: [${d.tokens.join(', ')}] = light: ${d.light}, dark: ${d.dark}`,
        );
      }
    }
    if (duplicateResults.crossFileDuplicates.length > 0) {
      console.log(`\n  Cross-file equivalent roles:`);
      for (const d of duplicateResults.crossFileDuplicates) {
        console.log(
          `   - [${d.tokens.map((t) => `${t.name} (${t.file})`).join(', ')}] = light: ${d.light}, dark: ${d.dark}`,
        );
      }
    }
  }

  if (verbose) {
    console.log('\nToken usage details:');
    for (const [name, callers] of results.usageMap.entries()) {
      console.log(`   ${name}: ${callers.length} callers`);
    }
  }

  if (!failed) {
    console.log(
      `\n✔ Token audit clean! No dead tokens or ghost tokens detected.\n`,
    );
    process.exit(0);
  } else {
    process.exit(1);
  }
}
