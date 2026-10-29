#!/usr/bin/env node
// Rewrites Bootstrap spacing utilities (margin, padding, gap) to Tailwind's
// scale, one family at a time (#477).
//
//   node scripts/codemods/bootstrap-spacing.mjs <family>... [-- <path>...]
//
//   node scripts/codemods/bootstrap-spacing.mjs gap
//   node scripts/codemods/bootstrap-spacing.mjs ms me mx -- src/customer
//
// Bootstrap and Tailwind use the same names (`mb-4`, `p-3`, `gap-2`) for
// different values, and Bootstrap's are `!important`, so until a family is
// retired from _utilities.scss every use of it renders Bootstrap's value.
// Run this for a family in the same change that removes the family from
// $utilities: rewriting `mb-4` to Tailwind's `mb-3` while Bootstrap still
// emits `.mb-3` would render Bootstrap's 9.75px instead of 12px.
//
// Only class positions are rewritten, found the same way as
// no-retired-bootstrap-utility finds them (string literals and template
// quasis that are not a name, a variant or a test title). Class names built
// at runtime (`mb-${space}`) and SCSS selectors are not seen: grep for them.

import console from 'node:console';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import {
  SPACING_FAMILIES,
  toTailwindSpacing,
} from '../../packages/eslint-plugin-waldur/rules/bootstrap-spacing.js';
import { notAClassList } from '../../packages/eslint-plugin-waldur/rules/class-name-tokens.js';

const root = path.resolve(fileURLToPath(import.meta.url), '../../..');

/**
 * Rewrites every whole spacing class in a node's source text. A token that
 * touches a `${…}` is a fragment of a computed name and is left alone.
 */
export const rewriteText = (text, families) =>
  text.replace(/(^|[\s'"`])([\w-]+)(?=[\s'"`]|$)/g, (match, before, token) => {
    const next = toTailwindSpacing(token, families);
    return next ? before + next : match;
  });

/** The argument list of a `cva(…)` call holds class lists too. */
const inCva = (node) => {
  for (let n = node.parent; n; n = n.parent) {
    if (n.type === 'CallExpression') return n.callee.name === 'cva';
  }
  return false;
};

const isClassList = (node) => !notAClassList(node) || inCva(node);

const rule = {
  meta: { type: 'suggestion', fixable: 'code', schema: [{ type: 'array' }] },
  create(context) {
    const families = context.options[0];
    const sourceCode = context.sourceCode;
    const check = (node) => {
      const text = sourceCode.getText(node);
      const next = rewriteText(text, families);
      if (next !== text) {
        context.report({
          node,
          message: 'Bootstrap spacing class',
          fix: (fixer) => fixer.replaceText(node, next),
        });
      }
    };
    return {
      Literal(node) {
        if (typeof node.value === 'string' && isClassList(node)) {
          check(node);
        }
      },
      TemplateElement(node) {
        if (isClassList(node.parent)) check(node);
      },
    };
  },
};

const main = async (argv) => {
  const split = argv.indexOf('--');
  const families = split === -1 ? argv : argv.slice(0, split);
  // Where the class lists render with Bootstrap loaded: the app and
  // Storybook (both import styles/bootstrap/index.scss). waldur-shell's chrome and the micro-apps never
  // load it, so their names are already Tailwind's.
  const paths =
    split === -1
      ? ['src', 'packages/ui', 'packages/form', 'packages/design-tokens']
      : argv.slice(split + 1);
  const unknown = families.filter((f) => !SPACING_FAMILIES.includes(f));
  if (!families.length || unknown.length) {
    console.error(
      `Usage: bootstrap-spacing.mjs <family>... [-- <path>...]\nFamilies: ${SPACING_FAMILIES.join(' ')}`,
    );
    process.exit(1);
  }
  const { ESLint } = await import('eslint');
  const prettier = await import('prettier');
  const RULE = 'bootstrap-spacing/rewrite';
  const eslint = new ESLint({
    cwd: root,
    overrideConfig: [
      // Their fixtures are Bootstrap names on purpose.
      {
        ignores: [
          'src/bootstrapCssUsage.test.ts',
          'src/tailwindBootstrapColors.test.ts',
          'src/tailwindBootstrapSpacing.test.ts',
        ],
      },
      {
        plugins: { 'bootstrap-spacing': { rules: { rewrite: rule } } },
        rules: { [RULE]: ['error', families] },
      },
    ],
    ruleFilter: ({ ruleId }) => ruleId === RULE,
  });
  // Not `fix: true`: ESLint re-lints fixed output up to ten times, which
  // would rewrite `gap-4` to `gap-3` and then that to `gap-2.5`. Each file's
  // fixes are applied once, from its original text.
  const results = await eslint.lintFiles(paths);
  let changed = 0;
  for (const { filePath, messages, source } of results) {
    const fixes = messages
      .filter((message) => message.fix)
      .map((message) => message.fix)
      .sort((a, b) => b.range[0] - a.range[0]);
    if (!fixes.length) continue;
    let text = source ?? readFileSync(filePath, 'utf8');
    for (const { range, text: replacement } of fixes) {
      text = text.slice(0, range[0]) + replacement + text.slice(range[1]);
    }
    // A longer class name can move a line past the print width.
    const options = await prettier.resolveConfig(filePath);
    writeFileSync(
      filePath,
      await prettier.format(text, { ...options, filepath: filePath }),
    );
    changed += 1;
  }
  console.log(`Rewrote ${families.join(' ')} in ${changed} files.`);
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main(process.argv.slice(2));
}
