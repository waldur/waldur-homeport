/**
 * ESLint rule keeping native selects on waldur-ui's NativeSelect.
 *
 * A browser `<select>` is a waldur-ui `NativeSelect` (the browser's popup and
 * keyboard, drawn like an Input, with a caret icon). So the ways back to
 * Bootstrap's `.form-select` are reported:
 *
 * - react-bootstrap's `FormSelect`, and `Form.Select` under whatever name
 *   `Form` was imported as, including the deep imports;
 * - a `form-select*` class token on any element.
 *
 * For a searchable or multi-value list use waldur-ui's `Select` instead.
 */

import {
  getClassNameAttribute,
  getClassNameTokens,
} from './class-name-tokens.js';

const LEGACY_CLASS = /^form-select(-|$)/;

const REPLACEMENT =
  "  Use waldur-ui's NativeSelect (or Select for a searchable list):\n" +
  "    import { NativeSelect } from 'waldur-ui';\n" +
  '    <NativeSelect value={v} onChange={…}><option value="a">A</option></NativeSelect>';

/** The leftmost identifier of `A.B.C`, or null. */
const rootName = (name) => {
  let node = name;
  while (node && node.type === 'JSXMemberExpression') {
    node = node.object;
  }
  return node && node.type === 'JSXIdentifier' ? node.name : null;
};

/** True for `X.Select`. */
const hasSelectMember = (name) =>
  name.type === 'JSXMemberExpression' && name.property.name === 'Select';

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Prevent react-bootstrap FormSelect and form-select classes; use waldur-ui NativeSelect',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      noFormSelectImport: "Avoid react-bootstrap's FormSelect.\n" + REPLACEMENT,
      noFormDotSelect: "Avoid react-bootstrap's {{ name }}.\n" + REPLACEMENT,
      noFormSelectClass:
        'The "{{ token }}" class no longer has any styles.\n' + REPLACEMENT,
    },
  },

  create(context) {
    // Local names react-bootstrap's `Form` was imported under.
    const formNames = new Set();

    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        if (source === 'react-bootstrap/FormSelect') {
          context.report({ node, messageId: 'noFormSelectImport' });
          return;
        }
        if (source === 'react-bootstrap/Form') {
          for (const specifier of node.specifiers) {
            if (specifier.type === 'ImportDefaultSpecifier') {
              formNames.add(specifier.local.name);
            }
          }
          return;
        }
        if (source !== 'react-bootstrap') {
          return;
        }
        for (const specifier of node.specifiers) {
          if (specifier.type !== 'ImportSpecifier') {
            continue;
          }
          const imported = specifier.imported.name;
          if (imported === 'FormSelect') {
            context.report({
              node: specifier,
              messageId: 'noFormSelectImport',
            });
          } else if (imported === 'Form') {
            formNames.add(specifier.local.name);
          }
        }
      },

      JSXOpeningElement(node) {
        if (
          node.name.type === 'JSXMemberExpression' &&
          formNames.has(rootName(node.name)) &&
          hasSelectMember(node.name)
        ) {
          context.report({
            node: node.name,
            messageId: 'noFormDotSelect',
            data: { name: context.sourceCode.getText(node.name) },
          });
        }

        for (const token of getClassNameTokens(node)) {
          if (LEGACY_CLASS.test(token)) {
            context.report({
              node: getClassNameAttribute(node) || node,
              messageId: 'noFormSelectClass',
              data: { token },
            });
            break;
          }
        }
      },
    };
  },
};
