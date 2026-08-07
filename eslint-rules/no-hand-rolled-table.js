/**
 * ESLint rule steering hand-rolled tables towards Waldur's Table.
 *
 * A react-bootstrap <Table>, or raw <table> markup, silently loses the header
 * styling, sort carets, column sizing, hover and selection, loading skeletons
 * and the shared NoResult empty state — so it looks visibly foreign next to
 * every other list in the app. This applies to small lists too: ones nested in
 * an expandable row, a tab or a modal.
 *
 * For data already in memory, `fetchData` may resolve rows directly rather than
 * using createFetcher — see docs/table/getting-started.md.
 *
 * Reported as a warning: the tree still has dozens of hand-rolled tables, and
 * converting one is a real behavioural change rather than a mechanical swap.
 * The rule is here to steer new code.
 */

// The shared table implementation, and markup that is not a data table.
const ALLOWED_FILES = ['src/table/', 'src/core/RichTextEditor'];

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer @/table/Table over react-bootstrap Table or raw <table> markup',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      noBootstrapTable:
        "Prefer Table from '@/table/Table' with useTable over react-bootstrap's Table.\n" +
        '  A hand-rolled table loses header styling, sort carets, column sizing,\n' +
        '  hover and selection, loading skeletons and the shared empty state.\n' +
        '  For in-memory rows, fetchData may resolve them directly:\n' +
        '    fetchData: () => Promise.resolve({ rows, resultCount: rows.length })',
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
      ImportDeclaration(node) {
        if (node.source.value !== 'react-bootstrap') {
          return;
        }
        const tableImport = node.specifiers.find(
          (specifier) =>
            specifier.type === 'ImportSpecifier' &&
            specifier.imported &&
            specifier.imported.name === 'Table',
        );
        if (tableImport) {
          context.report({ node: tableImport, messageId: 'noBootstrapTable' });
        }
      },

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
