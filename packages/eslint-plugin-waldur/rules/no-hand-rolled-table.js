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
 * A table that is not a data table at all (a <td> under test, an email
 * template) takes an eslint-disable directive with the reason.
 */

// The shared table implementation (waldur-table in packages/table, and
// homeport's layer over it in src/table), markup that is not a data table,
// and packages/ui/src/Table/Table.tsx — the table primitive that
// waldur-table builds on.
const ALLOWED_FILES = [
  'src/table/',
  'packages/table/',
  'src/core/RichTextEditor',
  'packages/ui/src/Table/Table.tsx',
  // Storybook demo of the tableCell select variant embedded in a row -- a
  // two-cell illustration, not a data table, and packages/ui can't depend on
  // @/table/Table (app-coupled, see the note above) regardless.
  'packages/ui/src/Select/Select.stories.tsx',
];

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
        "  - a form grid, custom layout, footer or preview -> Table primitives from 'waldur-ui'\n" +
        '  Not a data table at all (a <td> under test, an email template)?\n' +
        '  eslint-disable-next-line this rule with the reason.',
    },
  },

  create(context) {
    const filename = context.filename.replace(/\\/g, '/');
    if (ALLOWED_FILES.some((allowed) => filename.includes(allowed))) {
      return {};
    }
    return {
      // Raw markup is reported on the opening element rather than the import,
      // since there is nothing imported to point at.
      JSXOpeningElement(node) {
        if (
          node.name &&
          node.name.type === 'JSXIdentifier' &&
          node.name.name === 'table'
        ) {
          context.report({ node, messageId: 'noRawTable' });
        }
      },
    };
  },
};
