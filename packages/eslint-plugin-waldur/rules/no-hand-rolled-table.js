/**
 * ESLint rule steering hand-rolled tables towards Waldur's Table.
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
 * Reported as a warning: the tree still has dozens of hand-rolled tables, and
 * converting one is a real behavioural change rather than a mechanical swap.
 * The rule is here to steer new code.
 */

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

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer @/table/Table over raw <table> markup',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      noRawTable:
        "Prefer Table from '@/table/Table' over raw <table> markup.\n" +
        '  See docs/table/getting-started.md. If this is genuinely not a data\n' +
        "  table (e.g. an email or export template), add the file to the rule's\n" +
        '  allow-list with a note.',
    },
  },

  create(context) {
    const filename = context.getFilename().replace(/\\/g, '/');
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
