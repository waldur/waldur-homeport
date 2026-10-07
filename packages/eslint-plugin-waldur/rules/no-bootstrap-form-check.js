/**
 * ESLint rule keeping checkboxes, radios and switches on waldur-ui.
 *
 * Every one of them is now a waldur-ui `Checkbox`, `Radio` or `Switch`
 * (with their own `label` prop), and the Bootstrap/Metronic `.form-check`
 * stylesheet they used to need has been deleted. So both ways back to the
 * old look are reported:
 *
 * - react-bootstrap's `FormCheck`, and `Form.Check` (with its `.Input` and
 *   `.Label` parts) under whatever name `Form` was imported as;
 * - the same imports by deep path (`react-bootstrap/FormCheck`,
 *   `react-bootstrap/Form`) and `ToggleButton`, whose `.btn-check` input
 *   is now unstyled;
 * - a `form-check*`, `form-switch*` or `btn-check` class token on any element, which now
 *   styles nothing.
 *
 * This replaces `enforce-formcheck-components`, which pushed the other way
 * (towards `FormCheck`).
 */

import {
  getClassNameAttribute,
  getClassNameTokens,
} from './class-name-tokens.js';

const LEGACY_CLASS = /^(form-(check|switch)(-|$)|btn-check$)/;

const REPLACEMENT =
  "  Use waldur-ui's Checkbox, Radio, Switch or RadioGroup:\n" +
  "    import { Checkbox } from 'waldur-ui';\n" +
  '    <Checkbox label={…} checked={on} onCheckedChange={setOn} />';

/** The leftmost identifier of `A.B.C`, or null. */
const rootName = (name) => {
  let node = name;
  while (node && node.type === 'JSXMemberExpression') {
    node = node.object;
  }
  return node && node.type === 'JSXIdentifier' ? node.name : null;
};

/** True for `X.Check`, `X.Check.Input`, `X.Check.Label`. */
const hasCheckMember = (name) => {
  let node = name;
  while (node && node.type === 'JSXMemberExpression') {
    if (node.property.name === 'Check') {
      return true;
    }
    node = node.object;
  }
  return false;
};

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Prevent react-bootstrap FormCheck and form-check classes; use waldur-ui Checkbox, Radio, Switch and RadioGroup',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      noFormCheckImport:
        "Avoid react-bootstrap's FormCheck and ToggleButton.\n" + REPLACEMENT,
      noFormDotCheck: "Avoid react-bootstrap's {{ name }}.\n" + REPLACEMENT,
      noFormCheckClass:
        'The "{{ token }}" class no longer has any styles.\n' + REPLACEMENT,
    },
  },

  create(context) {
    // Local names react-bootstrap's `Form` was imported under.
    const formNames = new Set();

    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        if (source === 'react-bootstrap/FormCheck') {
          context.report({ node, messageId: 'noFormCheckImport' });
          return;
        }
        if (source === 'react-bootstrap/ToggleButton') {
          context.report({ node, messageId: 'noFormCheckImport' });
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
          if (imported === 'FormCheck' || imported === 'ToggleButton') {
            context.report({ node: specifier, messageId: 'noFormCheckImport' });
          } else if (imported === 'Form') {
            formNames.add(specifier.local.name);
          }
        }
      },

      JSXOpeningElement(node) {
        if (
          node.name.type === 'JSXMemberExpression' &&
          formNames.has(rootName(node.name)) &&
          hasCheckMember(node.name)
        ) {
          context.report({
            node: node.name,
            messageId: 'noFormDotCheck',
            data: { name: context.sourceCode.getText(node.name) },
          });
        }

        for (const token of getClassNameTokens(node)) {
          if (LEGACY_CLASS.test(token)) {
            context.report({
              node: getClassNameAttribute(node) || node,
              messageId: 'noFormCheckClass',
              data: { token },
            });
            break;
          }
        }
      },
    };
  },
};
