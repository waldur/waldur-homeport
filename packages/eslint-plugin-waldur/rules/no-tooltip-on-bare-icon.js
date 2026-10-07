/**
 * ESLint rule: a `Tooltip` must not wrap a bare icon.
 *
 * A phosphor icon is an `<svg>`: it cannot be focused and has no accessible
 * name, so `<Tooltip label="…"><WarningIcon /></Tooltip>` shows its text on
 * hover only. Keyboard and screen-reader users never get it. `HelpIcon` from
 * waldur-ui renders the icon inside a labelled button that Tooltip can attach
 * to. An icon that is already inside a button or link is fine, and is not
 * reported because the Tooltip's direct child is then the button.
 */

const ICON_NAME = /Icon$/;

const isIconElement = (child) =>
  child.type === 'JSXElement' &&
  child.openingElement.name.type === 'JSXIdentifier' &&
  ICON_NAME.test(child.openingElement.name.name);

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow Tooltip wrapped directly around an icon; use waldur-ui HelpIcon',
      category: 'Accessibility',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      bareIcon:
        '<Tooltip> wraps a bare <{{ name }}>: an icon cannot take keyboard focus and has no name, so the tooltip is hover-only.\n' +
        "  Use waldur-ui's HelpIcon:\n" +
        "    import { HelpIcon } from 'waldur-ui';\n" +
        '    <HelpIcon label={…} />  (or <WarningTip label={…} /> for warnings)',
    },
  },

  create(context) {
    const tooltipNames = new Set();

    return {
      ImportDeclaration(node) {
        if (node.source.value !== 'waldur-ui') {
          return;
        }
        for (const specifier of node.specifiers) {
          if (
            specifier.type === 'ImportSpecifier' &&
            specifier.imported.name === 'Tooltip'
          ) {
            tooltipNames.add(specifier.local.name);
          }
        }
      },

      JSXElement(node) {
        const name = node.openingElement.name;
        if (name.type !== 'JSXIdentifier' || !tooltipNames.has(name.name)) {
          return;
        }
        const children = node.children.filter(
          (child) => child.type !== 'JSXText' || child.value.trim() !== '',
        );
        if (children.length === 1 && isIconElement(children[0])) {
          context.report({
            node: children[0],
            messageId: 'bareIcon',
            data: { name: children[0].openingElement.name.name },
          });
        }
      },
    };
  },
};
