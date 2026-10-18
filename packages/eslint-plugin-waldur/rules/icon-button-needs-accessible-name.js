/**
 * ESLint rule: an icon-only waldur-ui `BaseButton`, and every
 * `CompactEditButton`, must be named.
 *
 * `BaseButton` renders `label` as its text. Without one it shows only
 * `iconNode`, and a screen reader announces just "button": nothing says what
 * it does. `BaseButton` turns a string `tooltip` into the `aria-label`, so a
 * tooltip is enough; otherwise pass `aria-label` (or `aria-labelledby`).
 * `CompactEditButton` takes no `label` at all, so it always needs one of the
 * three, or `fieldName`, which it turns into an "Edit <field>" tooltip.
 * `disabledReason` does not count: it names the button only while it is
 * disabled and has no tooltip.
 *
 * Spreading props onto the button (`{...props}`) is trusted to carry the
 * name, and a copy hidden with `aria-hidden="true"` is decorative.
 */

const NAMED_BY = new Set(['label', 'tooltip', 'aria-label', 'aria-labelledby']);

const isTrue = (attribute) =>
  attribute.value === null ||
  (attribute.value?.type === 'Literal' && attribute.value.value === true) ||
  (attribute.value?.type === 'Literal' && attribute.value.value === 'true') ||
  (attribute.value?.type === 'JSXExpressionContainer' &&
    attribute.value.expression.type === 'Literal' &&
    attribute.value.expression.value === true);

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require an accessible name on icon-only BaseButton and on CompactEditButton',
      category: 'Accessibility',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      unnamed:
        '<{{ name }}> shows only an icon and has no accessible name. Pass ' +
        '`tooltip` (it becomes the aria-label), or `aria-label` / ' +
        '`aria-labelledby` (or `fieldName` on CompactEditButton): a screen ' +
        'reader otherwise announces just "button".',
    },
  },

  create(context) {
    // Local name -> 'base' | 'compact' (handles `BaseButton as Button`).
    const buttons = new Map();

    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        for (const specifier of node.specifiers) {
          if (specifier.type !== 'ImportSpecifier') {
            continue;
          }
          const imported = specifier.imported.name;
          if (source === 'waldur-ui' && imported === 'BaseButton') {
            buttons.set(specifier.local.name, 'base');
          }
          if (
            /(^|\/)CompactEditButton$/.test(source) &&
            imported === 'CompactEditButton'
          ) {
            buttons.set(specifier.local.name, 'compact');
          }
        }
      },

      JSXOpeningElement(node) {
        if (node.name.type !== 'JSXIdentifier') {
          return;
        }
        const name = node.name.name;
        const kind = buttons.get(name);
        if (!kind) {
          return;
        }
        let hasIcon = kind === 'compact';
        for (const attribute of node.attributes) {
          if (attribute.type === 'JSXSpreadAttribute') {
            return;
          }
          if (
            attribute.type !== 'JSXAttribute' ||
            attribute.name.type !== 'JSXIdentifier'
          ) {
            continue;
          }
          const prop = attribute.name.name;
          if (
            NAMED_BY.has(prop) ||
            (kind === 'compact' && prop === 'fieldName')
          ) {
            return;
          }
          if (prop === 'aria-hidden' && isTrue(attribute)) {
            return;
          }
          if (prop === 'iconNode') {
            hasIcon = true;
          }
        }
        // A BaseButton with neither label nor icon renders nothing to name;
        // that is a different mistake, left to review.
        if (!hasIcon) {
          return;
        }
        context.report({ node, messageId: 'unnamed', data: { name } });
      },
    };
  },
};
