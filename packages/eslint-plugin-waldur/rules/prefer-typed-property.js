/**
 * ESLint rule: a PropertyItem whose value is formatted by hand should use a
 * propVal formatter from src/property/propertyFields.tsx.
 * The formatter owns the whole value: what counts as missing, how it reads,
 * what its copy icon copies.
 *
 *   value={formatDateTime(x)}                 → value={propVal.date(x, { precision: 'datetime' })}
 *   value={x ? translate('Yes') : translate('No')} → value={propVal.boolean(x)}
 *   value={defaultCurrency(x)}                → value={propVal.currency(x)}
 *   value={renderFieldOrDash(x)}              → value={x}: the row shows the dash
 *
 * Only `value` is read, and only a call, a Yes/No-style ternary or one of the
 * retired display components at its root, or behind `x ? f(x) : empty` /
 * `x && f(x)`. A value that composes more than that is left alone.
 *
 * Rows that predate the rule are counted per file and kind in
 * typed-property.baseline.json at the repository root. A file may hold as
 * many of a kind as listed; one more and every one of that kind is reported.
 * A file holding fewer than listed is reported as stale, so the counts only
 * shrink. `yarn lint:properties:baseline` rewrites the file.
 */

import { readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, '../../..');
const BASELINE_FILE = 'typed-property.baseline.json';

// Set by scripts/typed-property-baseline.mjs to see every case.
const IGNORE_BASELINE = process.env.WALDUR_TYPED_PROPERTY_BASELINE === 'ignore';

const ROWS = new Set(['PropertyItem', 'PropertyList.Item']);

/** A formatter call at the root of `value`, and what replaces it. */
const FORMATTERS = {
  formatDate: 'propVal.date(x)',
  formatDateTime: 'propVal.date(x, { precision: "datetime" })',
  formatMonth: 'propVal.date(x, { precision: "month" })',
  formatMediumDateTime: 'propVal.date(x, { precision: "long" })',
  formatShortDateTime: 'propVal.date(x, { precision: "datetime" })',
  formatRelative: 'propVal.date(x, { relative: true })',
  defaultCurrency: 'propVal.currency(x)',
  formatCount: 'propVal.count(x)',
  formatUsageValue: 'propVal.number(x)',
  formatFilesize: 'propVal.fileSize(x)',
  formatPercent: 'propVal.percent(x)',
  renderFieldOrDash: 'value={x}',
};

/** A retired display component at the root of `value`. */
const COMPONENTS = {
  CheckOrX: 'propVal.boolean(x, { wording: "enabled" })',
  BooleanField: 'propVal.boolean(x, { display: "badge" })',
  FormattedHtml: 'propVal.richText(x, { format: "html" })',
  SafeMarkdown: 'propVal.richText(x, { format: "markdown" })',
};

/** The translated word pairs a boolean reads as. */
const BOOLEAN_WORDS = new Map([
  ['Yes|No', 'propVal.boolean(x)'],
  ['Enabled|Disabled', 'propVal.boolean(x, { wording: "enabled" })'],
  ['Active|Inactive', 'propVal.boolean(x, { wording: "active" })'],
]);

const jsxName = (name) =>
  name.type === 'JSXIdentifier'
    ? name.name
    : name.type === 'JSXMemberExpression'
      ? `${jsxName(name.object)}.${name.property.name}`
      : null;

const calleeName = (node) =>
  node?.type === 'CallExpression' && node.callee.type === 'Identifier'
    ? node.callee.name
    : null;

const translatedWord = (node) =>
  calleeName(node) === 'translate' &&
  node.arguments[0]?.type === 'Literal' &&
  typeof node.arguments[0].value === 'string'
    ? node.arguments[0].value
    : null;

/** `x.join(', ')` or `x?.join(', ')`. */
const isCommaJoin = (node) => {
  const call = node?.type === 'ChainExpression' ? node.expression : node;
  return (
    call?.type === 'CallExpression' &&
    call.callee.type === 'MemberExpression' &&
    call.callee.property.name === 'join' &&
    call.arguments[0]?.type === 'Literal' &&
    call.arguments[0].value === ', '
  );
};

const isEmptyLiteral = (node) =>
  (node.type === 'Literal' &&
    (node.value === null || ['', '-', '—'].includes(node.value))) ||
  (node.type === 'Identifier' &&
    ['undefined', 'DASH_ESCAPE_CODE'].includes(node.name)) ||
  calleeName(node) === 'renderFieldOrDash';

/** The typed property that replaces `value`'s expression, if one does. */
const replacementFor = (node) => {
  if (!node) return null;
  const called = calleeName(node);
  if (called && FORMATTERS[called]) return FORMATTERS[called];
  if (node.type === 'JSXElement') {
    return COMPONENTS[jsxName(node.openingElement.name)] ?? null;
  }
  if (isCommaJoin(node)) return 'propVal.list(x)';
  if (node.type === 'ConditionalExpression') {
    const words = `${translatedWord(node.consequent)}|${translatedWord(node.alternate)}`;
    if (BOOLEAN_WORDS.has(words)) return BOOLEAN_WORDS.get(words);
    // x ? formatDateTime(x) : null
    if (isEmptyLiteral(node.alternate)) return replacementFor(node.consequent);
  }
  // x && formatDateTime(x)
  if (node.type === 'LogicalExpression' && node.operator === '&&') {
    return replacementFor(node.right);
  }
  return null;
};

let baseline = { mtimeMs: -1, entries: {} };

/** typed-property.baseline.json, re-read when it changes on disk. */
const readBaseline = (file) => {
  try {
    const { mtimeMs } = statSync(file);
    if (mtimeMs !== baseline.mtimeMs) {
      baseline = { mtimeMs, entries: JSON.parse(readFileSync(file, 'utf8')) };
    }
  } catch {
    baseline = { mtimeMs: -1, entries: {} };
  }
  return baseline.entries;
};

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer propVal formatters (propVal.date, propVal.boolean, …) to formatting a PropertyItem value by hand',
      category: 'Best Practices',
      recommended: true,
    },
    schema: [],
    messages: {
      prefer:
        'This PropertyItem formats its value by hand; use {{ replacement }} with PropertyItem from @/property/propertyFields, which also decides when the value is missing and what it copies.',
      dash: 'A PropertyItem draws a missing value itself: a dash in a divided list, no row in a summary list (hideIfEmpty={false} keeps the row and its dash). Pass value={x} instead of renderFieldOrDash(x).',
      stale:
        'typed-property.baseline.json lists {{ listed }} "{{ kind }}" row(s) for this file, but it has {{ found }}. Run `yarn lint:properties:baseline` to update the list.',
    },
  },

  create(context) {
    const relativeFile = path
      .relative(REPO_ROOT, context.filename)
      .split(path.sep)
      .join('/');

    /** kind → nodes */
    const found = new Map();

    return {
      JSXOpeningElement(node) {
        if (!ROWS.has(jsxName(node.name))) return;
        const value = node.attributes.find(
          (attribute) =>
            attribute.type === 'JSXAttribute' &&
            attribute.name.name === 'value' &&
            attribute.value?.type === 'JSXExpressionContainer',
        );
        const replacement = replacementFor(value?.value.expression);
        if (!replacement) return;
        if (!found.has(replacement)) found.set(replacement, []);
        found.get(replacement).push(value);
      },

      'Program:exit'(program) {
        const listed = IGNORE_BASELINE
          ? {}
          : (readBaseline(path.join(REPO_ROOT, BASELINE_FILE))[relativeFile] ??
            {});

        for (const [kind, nodes] of found) {
          if (nodes.length <= (listed[kind] ?? 0)) continue;
          for (const node of nodes) {
            context.report(
              kind === 'value={x}'
                ? { node, messageId: 'dash' }
                : { node, messageId: 'prefer', data: { replacement: kind } },
            );
          }
        }
        for (const [kind, count] of Object.entries(listed)) {
          const have = found.get(kind)?.length ?? 0;
          if (have < count) {
            context.report({
              node: program,
              loc: { line: 1, column: 0 },
              messageId: 'stale',
              data: { kind, listed: String(count), found: String(have) },
            });
          }
        }
      },
    };
  },
};
