/**
 * ESLint rule keeping dialogs on waldur-ui's Modal.
 *
 * Every dialog now renders through waldur-ui's ModalShell and ModalDialog
 * (re-exported by src/modal), and the Bootstrap/Metronic modal and close
 * button stylesheets are deleted.
 *
 * A `modal`, `modal-*` or `btn-close` class token, on an element or in a
 * `className`/`dialogClassName`/`backdropClassName` string passed to a
 * dialog is reported, which now styles nothing.
 */

import {
  getClassNameAttribute,
  getClassNameTokens,
} from './class-name-tokens.js';

const LEGACY_CLASS = /^(modal|modal-(?!passthrough:).+|btn-close(-white)?)$/;

// Props whose string value is a class list for a dialog (openDialog's
// options, ModalShell's props).
const CLASS_PROPS = new Set([
  'className',
  'dialogClassName',
  'backdropClassName',
  'bodyClassName',
  'headerClassName',
  'footerClassName',
]);

const REPLACEMENT =
  "  Use waldur-ui's Modal (see docs/modals.md):\n" +
  "    openDialog(MyDialog, { size: 'lg' }) with <ModalDialog title footer>…</ModalDialog>,\n" +
  '    <ModalShell open onHide> for a dialog rendered in place, or\n' +
  '    ModalHeader / ModalTitle / ModalBody / ModalFooter / ModalCloseButton for a custom layout.\n' +
  '  Style a part through its data-slot (modal-dialog, modal-content, modal-body, …).';

const legacyToken = (value) =>
  typeof value === 'string'
    ? value.split(/\s+/).find((token) => LEGACY_CLASS.test(token))
    : undefined;

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent modal/btn-close classes; use waldur-ui Modal',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      noModalClass:
        'The "{{ token }}" class no longer has any styles.\n' + REPLACEMENT,
    },
  },

  create(context) {
    return {
      JSXOpeningElement(node) {
        for (const token of getClassNameTokens(node)) {
          if (LEGACY_CLASS.test(token)) {
            context.report({
              node: getClassNameAttribute(node) || node,
              messageId: 'noModalClass',
              data: { token },
            });
            break;
          }
        }
        // dialogClassName="…" and friends on a dialog component.
        for (const attribute of node.attributes) {
          if (
            attribute.type !== 'JSXAttribute' ||
            attribute.name.name === 'className' ||
            !CLASS_PROPS.has(attribute.name.name) ||
            attribute.value?.type !== 'Literal'
          ) {
            continue;
          }
          const token = legacyToken(attribute.value.value);
          if (token) {
            context.report({
              node: attribute,
              messageId: 'noModalClass',
              data: { token },
            });
          }
        }
      },

      // openDialog(Component, { dialogClassName: '…' }).
      Property(node) {
        if (
          node.key?.type !== 'Identifier' ||
          !CLASS_PROPS.has(node.key.name) ||
          node.key.name === 'className' ||
          node.value.type !== 'Literal'
        ) {
          return;
        }
        const token = legacyToken(node.value.value);
        if (token) {
          context.report({
            node,
            messageId: 'noModalClass',
            data: { token },
          });
        }
      },
    };
  },
};
