/**
 * ESLint rule: a waldur-ui `Checkbox`, `Radio` or `Switch`, and the form-level
 * `SwitchField`, must be named.
 *
 * The control draws its own label when it is given `label`, `description` or
 * `tooltip`. Without them it is a bare box or track, so nothing says what it
 * switches: a screen reader announces "checkbox, not checked", however clearly
 * the page shows the text beside it. A bare control therefore needs
 * `aria-label` (or `aria-labelledby`). Spreading props onto it (`{...props}`)
 * is trusted to carry one. A control inside a `<label>` is named by it, and
 * one with `aria-hidden` is a decorative copy of a control that exists
 * elsewhere (a menu row's box), so neither is reported.
 *
 * Typical offenders are a switch placed in a table row's `actions` or in a
 * header's `quickAction`, where the text sits in a sibling element.
 */

const NAMED_BY = new Set([
  'label',
  'description',
  'tooltip',
  'aria-label',
  'aria-labelledby',
]);

const CONTROLS = new Set(['Checkbox', 'Radio', 'Switch']);

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require an accessible name on waldur-ui Checkbox, Radio, Switch and on SwitchField',
      category: 'Accessibility',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      unnamed:
        '<{{ name }}> has no accessible name. Pass `label`, or `aria-label` ' +
        '(or `aria-labelledby`) when the text is elsewhere on the page: a bare control is announced as just a checkbox, with no hint what it changes.',
    },
  },

  create(context) {
    // Local names for the waldur-ui controls (handles `Switch as UiSwitch`).
    const controlNames = new Set();

    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        if (source === 'waldur-ui') {
          for (const specifier of node.specifiers) {
            if (
              specifier.type === 'ImportSpecifier' &&
              CONTROLS.has(specifier.imported.name)
            ) {
              controlNames.add(specifier.local.name);
            }
          }
        }
        // The adapter is imported from the form folder, by relative or alias path.
        if (/(^|\/)SwitchField$/.test(source)) {
          for (const specifier of node.specifiers) {
            if (specifier.type === 'ImportSpecifier') {
              controlNames.add(specifier.local.name);
            }
          }
        }
      },

      JSXOpeningElement(node) {
        if (node.name.type !== 'JSXIdentifier') {
          return;
        }
        const name = node.name.name;
        if (!controlNames.has(name)) {
          return;
        }
        // `<label><Checkbox /> text</label>` names the box implicitly.
        for (let up = node.parent?.parent; up; up = up.parent) {
          if (
            up.type === 'JSXElement' &&
            up.openingElement.name.type === 'JSXIdentifier' &&
            up.openingElement.name.name === 'label'
          ) {
            return;
          }
        }
        for (const attribute of node.attributes) {
          if (attribute.type === 'JSXSpreadAttribute') {
            return;
          }
          if (
            attribute.type === 'JSXAttribute' &&
            attribute.name.type === 'JSXIdentifier' &&
            (NAMED_BY.has(attribute.name.name) ||
              (attribute.name.name === 'aria-hidden' &&
                attribute.value?.type === 'Literal' &&
                attribute.value.value === 'true'))
          ) {
            return;
          }
        }
        context.report({ node, messageId: 'unnamed', data: { name } });
      },
    };
  },
};
