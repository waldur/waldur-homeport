/**
 * ESLint rule steering hand-rolled tables towards Waldur's table components:
 * Table for lists of records, SimpleTable for read-only in-memory lists,
 * PropertyList for label/value pairs, and waldur-ui's Table primitives
 * (allow-listed below) for form grids. See docs/table/migration-guide.md.
 *
 * Raw <table> markup silently loses the header styling, sort carets, column
 * sizing, hover and selection, loading skeletons and the shared NoResult empty
 * state — so it looks visibly foreign next to every other list in the app.
 * This applies to small lists too: ones nested in an expandable row, a tab or
 * a modal.
 *
 * For data already in memory, `fetchData` may resolve rows directly rather than
 * using createFetcher — see docs/table/getting-started.md.
 *
 * Converting one is a real behavioural change rather than a mechanical swap,
 * so the tables that predate the rule are counted per file in
 * hand-rolled-table.baseline.json at the repository root. A file may hold as
 * many as listed; one more reports every table in it. A file holding fewer
 * than listed is reported as stale, so the counts only shrink.
 * `yarn lint:tables:baseline` rewrites the file.
 *
 * A table an eslint-disable directive turns this rule off for (next-line,
 * same-line, a disable/enable block or the whole file) is a deliberate
 * exception: it is still reported, so ESLint suppresses it and the directive
 * stays in use, but it is not counted against the baseline.
 */

import path from 'node:path';
import process from 'node:process';

import {
  REPO_ROOT,
  createBaselineReader,
  repoRelative,
} from '../lib/baseline.js';

// Set by scripts/hand-rolled-table-baseline.mjs to see every case.
const IGNORE_BASELINE =
  process.env.WALDUR_HAND_ROLLED_TABLE_BASELINE === 'ignore';

// The rule's tests point this at a fixture.
const baselineFile = () =>
  process.env.WALDUR_HAND_ROLLED_TABLE_BASELINE_FILE ??
  path.join(REPO_ROOT, 'hand-rolled-table.baseline.json');

// The shared table implementation, markup that is not a data table, and
// packages/ui/src/Table/Table.tsx — the shadcn-recipe table primitive
// (DataTable.tsx builds on it) for standalone micro-apps (apps/*), which
// deliberately can't depend on @/table/Table (Redux table-store +
// Bootstrap coupled to homeport's own src/). See docs/micro-apps.md and
// Table.tsx's own header comment.
const ALLOWED_FILES = [
  'src/table/',
  'src/core/RichTextEditor',
  'packages/ui/src/Table/Table.tsx',
  // A grid of form inputs, one per offering component, inside a dialog -- not
  // a list of data. @/table/Table brings a fetch cycle, an action bar, a
  // reserved min-height and column sizing meant for a page of rows, all of
  // which fight a four-row price editor in a modal. Same shape as
  // SetQuotasDialog's own table.
  'src/marketplace/offerings/update/plans/PricesTable.tsx',
  // Storybook demo of the tableCell select variant embedded in a row -- a
  // two-cell illustration, not a data table, and packages/ui can't depend on
  // @/table/Table (app-coupled, see the note above) regardless.
  'packages/ui/src/Select/Select.stories.tsx',
  // A form grid: one organization select per discovered Arrow customer, in a
  // wizard step. Paging would hide mappings still being chosen; see
  // docs/table/migration-guide.md, "Form grid".
  'src/administration/arrow/setup/Step2CustomerDiscovery.tsx',
];

const readBaseline = createBaselineReader();

// This rule in a directive's rule list, under any plugin prefix (RuleTester
// names it rule-to-test/). An empty list turns every rule off.
const namesThisRule = (value) =>
  !value.trim() ||
  value
    .split(',')
    .some((name) => /^(?:[\w@-]+\/)?no-hand-rolled-table$/.test(name.trim()));

/**
 * Whether an eslint-disable directive turns this rule off at node, the way
 * ESLint applies them: next-line and same-line by line, disable/enable as a
 * running state in source order.
 */
const isDisabled = (sourceCode, node) => {
  const line = node.loc.start.line;
  let disabled = false;
  for (const { type, node: comment, value } of sourceCode.getDisableDirectives()
    .directives) {
    if (!namesThisRule(value)) continue;
    if (type === 'disable-next-line' && comment.loc.end.line + 1 === line)
      return true;
    if (type === 'disable-line' && comment.loc.start.line === line) return true;
    if (
      (type === 'disable' || type === 'enable') &&
      comment.range[1] <= node.range[0]
    ) {
      disabled = type === 'disable';
    }
  }
  return disabled;
};

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Replace raw <table> markup with Table, SimpleTable, PropertyList or waldur-ui Table primitives',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      noRawTable:
        'Raw <table> markup. Pick the replacement by what the table is\n' +
        '  (decision tree: docs/table/migration-guide.md):\n' +
        "  - a list of records (paged, filtered, row actions) -> Table from '@/table/Table'\n" +
        "  - a read-only list already in memory -> SimpleTable from '@/table/SimpleTable'\n" +
        "  - label/value pairs about one object -> PropertyList from 'waldur-ui'\n" +
        "  - a grid of form inputs -> waldur-ui's Table primitives, with the file in\n" +
        "    this rule's ALLOWED_FILES and a one-line reason\n" +
        '  Not a data table at all (a <td> under test, an email template)?\n' +
        '  eslint-disable-next-line this rule with the reason.',
      stale:
        'hand-rolled-table.baseline.json lists {{ listed }} table(s) for this file, but it has {{ found }}. Run `yarn lint:tables:baseline` to update the list.',
    },
  },

  create(context) {
    const filename = context.filename.replace(/\\/g, '/');
    if (ALLOWED_FILES.some((allowed) => filename.includes(allowed))) {
      return {};
    }
    const relativeFile = repoRelative(context.filename);

    const found = [];
    const exempt = [];

    return {
      // Raw markup is reported on the opening element rather than the import,
      // since there is nothing imported to point at.
      JSXOpeningElement(node) {
        if (
          node.name &&
          node.name.type === 'JSXIdentifier' &&
          node.name.name === 'table'
        ) {
          (isDisabled(context.sourceCode, node) ? exempt : found).push(node);
        }
      },

      'Program:exit'(program) {
        for (const node of exempt) {
          context.report({ node, messageId: 'noRawTable' });
        }
        const listed = IGNORE_BASELINE
          ? 0
          : (readBaseline(baselineFile())[relativeFile] ?? 0);
        if (found.length > listed) {
          for (const node of found) {
            context.report({ node, messageId: 'noRawTable' });
          }
        } else if (found.length < listed) {
          context.report({
            node: program,
            loc: { line: 1, column: 0 },
            messageId: 'stale',
            data: { listed: String(listed), found: String(found.length) },
          });
        }
      },
    };
  },
};
