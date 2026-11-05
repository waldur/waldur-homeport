/**
 * Finds raw `rem` lengths in source files and names the px they come to at
 * HomePort's 13px root, plus the spacing or text token that equals it.
 *
 * HomePort forces `html { font-size: 13px }` (12px on phones), so every rem
 * is tuned against that root. The design tokens are pinned in px; a rem
 * literal is what still ties a size to the root, and what has to go before
 * the root can return to the browser default. Media-query rem is not one of
 * them: it is relative to the browser's initial font size, not `html`'s.
 * Container-query rem is: it reads the root's computed font size.
 *
 * Only code is searched, never comments:
 *   - TS/JS: string and template literals, so arbitrary Tailwind classes
 *     (`p-[1.85rem]`, `mt-[0.5rem]`) and inline style values
 *     (`style={{ padding: '0.5rem' }}`) alike.
 *   - CSS/SCSS: declaration values (SCSS variables included) and the
 *     arguments of a mixin call (`@include x(1rem)`).
 * A zero length (`0rem`) is not counted: it is 0 at any root.
 *
 * Shared by scripts/rem-literals.mjs (the CI ratchet), the ESLint rule
 * waldur-custom/no-rem-length and the stylelint rule waldur/no-rem-length, so
 * they agree on what a rem literal is and which files are covered.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import postcss from 'postcss';
import postcssScss from 'postcss-scss';
import ts from 'typescript';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../../..');

/** rem literal count per file that `yarn rem:check` holds the code to. */
export const BASELINE = path.join(
  repoRoot,
  'scripts/rem-literals.baseline.json',
);

/** HomePort's root font size on desktop (src/tailwind.css). */
const ROOT_PX = 13;

/** `--spacing` (primitives/spacing.css). */
const SPACING_PX = 4;

/** `--text-*` sizes (primitives/typography.css). */
const TEXT_TOKENS = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
};

// Where a rem is the point, not a shortcut. Each entry says why.
const ALLOWED = {
  'packages/design-tokens/src/css/': 'design token sources',
  'packages/design-tokens/scripts/': 'token tooling: rem in its own tables',
  'packages/eslint-plugin-waldur/': 'lint rules: rem in messages and tables',
  'packages/stylelint-plugin-waldur/': 'lint rules: rem in messages and tables',
};

const SKIPPED = [
  /\.(?:test|spec)\.[jt]sx?$/,
  /\.stories\.[jt]sx?$/,
  /^src\/test\//,
  /(?:^|\/)__mocks__\//,
  /\.d\.ts$/,
];

/** Whether a repo-relative path is a source file the rem checks cover. */
export function isCovered(file) {
  return (
    /\.(?:[cm]?[jt]sx?|s?css)$/.test(file) &&
    !SKIPPED.some((re) => re.test(file)) &&
    !Object.keys(ALLOWED).some((prefix) => file.startsWith(prefix))
  );
}

/** A file's path relative to the repository, with forward slashes. */
export function repoPath(file) {
  return path.relative(repoRoot, path.resolve(file)).split(path.sep).join('/');
}

// A number with a rem unit, signed or not, standing on its own or right after
// an operator with no spaces round it, as Tailwind's arbitrary values write
// it (`max-w-[calc(100vw-3rem)]`).
const REM =
  /(?:(?<![\w.$-])-?|(?<=(?:\d(?:[a-z]+|%)?|\))-))(?:\d+\.?\d*|\.\d+)rem(?![\w-])/gi;

const round = (n) => Math.round(n * 100) / 100;
// A literal written to three decimals (`0.923rem`) is within 0.007px of the
// px it stands for, one written to two (`1.85rem`) within 0.07px.
const near = (a, b) => Math.abs(a - b) < 0.07;
const exact = (a, b) => Math.abs(a - b) < 0.01;

/**
 * What a rem length comes to at the 13px root and the token that equals it:
 * `{ px, token, utility, exact }`. For a font size, `token` is `var(--text-sm)` and
 * `utility` `text-sm`; for any other length, `calc(var(--spacing) * 3)` and
 * the Tailwind step `3` (`p-3`, `gap-3`, …). Both are undefined when no token
 * is within 0.07px of it, `exact` when within 0.01px (`0.923rem` is 12px,
 * `1.85rem` is ≈ 24px). Steps are whole or half (`p-1.5`).
 */
export function remEquivalent(value, { fontSize = false } = {}) {
  const rem = parseFloat(value);
  const px = round(rem * ROOT_PX);
  if (fontSize) {
    const name = Object.keys(TEXT_TOKENS).find((k) =>
      near(TEXT_TOKENS[k], Math.abs(px)),
    );
    if (!name) return { px };
    return {
      px,
      token: `var(--text-${name})`,
      utility: `text-${name}`,
      exact: exact(TEXT_TOKENS[name], Math.abs(px)),
    };
  }
  const step = Math.round((px / SPACING_PX) * 2) / 2;
  if (step === 0 || !near(step * SPACING_PX, px)) return { px };
  return {
    px,
    token: `calc(var(--spacing) * ${step})`,
    utility: `${step}`,
    exact: exact(step * SPACING_PX, px),
  };
}

/** The key or JSX attribute name a string literal is the value of. */
function ownerName(node) {
  const parent = node.parent;
  if (ts.isPropertyAssignment(parent) && parent.initializer === node) {
    return parent.name.getText().replace(/['"]/g, '');
  }
  return null;
}

/** The whitespace-delimited word of `text` around `index`. */
function wordAt(text, index) {
  const start = text.slice(0, index).search(/\S*$/);
  const end = index + text.slice(index).search(/\s|$/);
  return text.slice(start, end);
}

function scanScript(source, fileName, push) {
  const kind = /\.[jt]sx$/.test(fileName)
    ? ts.ScriptKind.TSX
    : ts.ScriptKind.TS;
  const sf = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true,
    kind,
  );
  const visit = (node) => {
    if (
      ts.isStringLiteral(node) ||
      ts.isNoSubstitutionTemplateLiteral(node) ||
      ts.isTemplateHead(node) ||
      ts.isTemplateMiddle(node) ||
      ts.isTemplateTail(node)
    ) {
      const start = node.getStart(sf) + 1;
      const text = node.text;
      for (const m of text.matchAll(REM)) {
        const word = wordAt(text, m.index);
        const bracket = word.indexOf('-[');
        if (bracket > 0 && word.endsWith(']')) {
          // An arbitrary Tailwind class: `text-[1.077rem]` is a font size,
          // `text-[length:…]` too; anything else is a length.
          const utility = word.slice(0, bracket).split(':').pop();
          push('class', m[0], start + m.index, utility === 'text');
        } else {
          const owner = ownerName(node);
          push(
            'style',
            m[0],
            start + m.index,
            owner === 'fontSize' || owner === 'font-size',
          );
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
}

// At-rules whose rem is not tied to `html`'s font size, or that hold no
// length. A media query reads the browser's initial font size; a container
// query does not (its rem is the root's computed size), so it is counted.
const SKIPPED_AT_RULES = /^(?:media|supports|import|use|forward)$/i;

function scanStyles(source, fileName, push) {
  const root = (fileName.endsWith('.scss') ? postcssScss : postcss).parse(
    source,
  );
  root.walk((node) => {
    let text;
    let start;
    let fontSize = false;
    if (node.type === 'decl') {
      text = node.value;
      start =
        node.source.start.offset +
        node.prop.length +
        (node.raws.between?.length ?? 1);
      fontSize = /^font(-size)?$/i.test(node.prop);
    } else if (node.type === 'atrule' && !SKIPPED_AT_RULES.test(node.name)) {
      text = node.params;
      start =
        node.source.start.offset +
        1 +
        node.name.length +
        (node.raws.afterName?.length ?? 0);
    } else {
      return;
    }
    // Interpolated or raw values keep their offsets only when postcss saw the
    // value verbatim; fall back to the source text in that case.
    const raw = node.type === 'decl' ? node.raws.value?.raw : undefined;
    if (raw !== undefined) text = raw;
    // Blank out comments and quoted strings, keeping offsets.
    const code = text.replace(/\/\*[\s\S]*?\*\/|(['"]).*?\1/g, (m) =>
      ' '.repeat(m.length),
    );
    for (const m of code.matchAll(REM)) {
      push('declaration', m[0], start + m.index, fontSize);
    }
  });
}

/** Offset → 1-based line and column. */
function locator(source) {
  const starts = [0];
  for (let i = 0; i < source.length; i++) {
    if (source[i] === '\n') starts.push(i + 1);
  }
  return (offset) => {
    let lo = 0;
    let hi = starts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (starts[mid] <= offset) lo = mid;
      else hi = mid - 1;
    }
    return { line: lo + 1, column: offset - starts[lo] + 1 };
  };
}

/**
 * Lists the rem literals in one file's source, ordered by position:
 * `{ kind: 'declaration' | 'class' | 'style', value, line, column, px,
 * token }` (see `remEquivalent`).
 */
export function findRemLiterals(source, fileName) {
  const found = [];
  const push = (kind, value, offset, fontSize) => {
    if (parseFloat(value) === 0) return;
    found.push({ kind, value, offset, fontSize });
  };
  if (/\.s?css$/.test(fileName)) {
    scanStyles(source, fileName, push);
  } else {
    scanScript(source, fileName, push);
  }
  const locate = locator(source);
  return found
    .sort((a, b) => a.offset - b.offset)
    .map(({ kind, value, offset, fontSize }) => ({
      kind,
      value,
      ...locate(offset),
      ...remEquivalent(value, { fontSize }),
    }));
}

/**
 * `1.5385rem = 20px at the 13px root (= Tailwind step 5)`, or ≈ when the
 * token is within 0.07px: what a literal
 * comes to and, when a token equals it, that token in the form its kind of
 * code writes it.
 */
export function describeRem({ kind, value, px, token, utility, exact }) {
  let hint = '';
  if (token) {
    const sign = exact ? '=' : '≈';
    const name =
      kind === 'declaration'
        ? token
        : utility.startsWith('text-')
          ? utility
          : `Tailwind step ${utility}`;
    hint = ` (${sign} ${name})`;
  }
  return `${value} = ${px}px at the 13px root${hint}`;
}
