/**
 * ESLint rule keeping dialogs on waldur-ui's Modal.
 *
 * Every dialog now renders through waldur-ui's ModalShell and ModalDialog
 * (re-exported by src/modal), and the Bootstrap/Metronic modal and close
 * button stylesheets are deleted. So every way back to the old markup is
 * reported:
 *
 * - react-bootstrap's `Modal` (and its parts), `CloseButton` and
 *   `ModalContext`, by name or by deep path;
 * - a `modal`, `modal-*` or `btn-close` class token, on an element or in a
 *   `className`/`dialogClassName`/`backdropClassName` string passed to a
 *   dialog, which now styles nothing.
 */

import {
  getClassNameAttribute,
  getClassNameTokens,
} from './class-name-tokens.js';

const LEGACY_CLASS = /^(modal|modal-(?!passthrough:).+|btn-close(-white)?)$/;

const LEGACY_IMPORTS = new Set(['Modal', 'CloseButton', 'ModalContext']);

const LEGACY_DEEP_IMPORT =
  /^react-bootstrap\/(Modal\w*|CloseButton|ModalContext)$/;

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
      description:
        'Prevent react-bootstrap Modal and modal/btn-close classes; use waldur-ui Modal',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      noModalImport: "Avoid react-bootstrap's {{ name }}.\n" + REPLACEMENT,
      noModalClass:
        'The "{{ token }}" class no longer has any styles.\n' + REPLACEMENT,
    },
  },

  create(context) {
    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        if (LEGACY_DEEP_IMPORT.test(source)) {
          context.report({
            node,
            messageId: 'noModalImport',
            data: { name: source.slice('react-bootstrap/'.length) },
          });
          return;
        }
        if (source !== 'react-bootstrap') {
          return;
        }
        for (const specifier of node.specifiers) {
          if (
            specifier.type === 'ImportSpecifier' &&
            LEGACY_IMPORTS.has(specifier.imported.name)
          ) {
            context.report({
              node: specifier,
              messageId: 'noModalImport',
              data: { name: specifier.imported.name },
            });
          }
        }
      },

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
