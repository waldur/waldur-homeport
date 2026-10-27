/**
 * ESLint rule keeping react-bootstrap's `Stack` off its `gap` prop.
 *
 * `Stack` turns `gap={4}` into a `gap-4` class at runtime. That name is
 * Tailwind's step now (16px, not Bootstrap's 12px), because Bootstrap no
 * longer generates gap utilities, and Tailwind only generates a class it
 * finds written in source, so `gap={10}` renders no gap at all. The spacing
 * codemod saw class lists only, so it left the prop alone.
 *
 * Write the gap as a class instead, at Bootstrap's step on Tailwind's scale
 * (SPACER_TO_TAILWIND). The fix does that for a numeric `gap` beside a
 * missing or plain-string `className`. It only reports when the result
 * could render differently from what Stack does now: a spread may carry a
 * className of its own, and a gap class already in `className` (`gap-1`,
 * `md:gap-5`, `gap-x-2`) wins or loses against the runtime one by
 * Tailwind's ordering, not by position.
 */

import { SPACER_TO_TAILWIND } from './bootstrap-spacing.js';
import { getClassNameAttribute } from './class-name-tokens.js';

const GAP_CLASS = /^(?:[\w-]+:)*gap-/;
const STACK_MODULE = /^react-bootstrap(?:\/(?:esm|cjs))?\/Stack$/;

const getNumericValue = (attr) => {
  const value = attr.value;
  if (
    value &&
    value.type === 'JSXExpressionContainer' &&
    value.expression.type === 'Literal' &&
    typeof value.expression.value === 'number'
  ) {
    return value.expression.value;
  }
  return null;
};

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        "Prevent react-bootstrap Stack's gap prop; write the gap as a Tailwind class",
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      noStackGap:
        "react-bootstrap's Stack renders its gap prop as a runtime gap-N class, which is Tailwind's step " +
        "(or nothing, when no source spells it), not Bootstrap's. Put the class in className instead{{ hint }}.",
    },
  },

  create(context) {
    const sourceCode = context.sourceCode;
    const stackNames = new Set();
    const namespaces = new Set();

    const isStack = (name) =>
      (name.type === 'JSXIdentifier' && stackNames.has(name.name)) ||
      (name.type === 'JSXMemberExpression' &&
        name.object.type === 'JSXIdentifier' &&
        namespaces.has(name.object.name) &&
        name.property.name === 'Stack');

    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        for (const specifier of node.specifiers) {
          if (source === 'react-bootstrap') {
            if (
              specifier.type === 'ImportSpecifier' &&
              specifier.imported.name === 'Stack'
            ) {
              stackNames.add(specifier.local.name);
            } else if (specifier.type === 'ImportNamespaceSpecifier') {
              namespaces.add(specifier.local.name);
            }
          } else if (
            STACK_MODULE.test(source) &&
            (specifier.type === 'ImportDefaultSpecifier' ||
              (specifier.type === 'ImportSpecifier' &&
                specifier.imported.name === 'default'))
          ) {
            stackNames.add(specifier.local.name);
          }
        }
      },

      JSXOpeningElement(node) {
        if (!isStack(node.name)) {
          return;
        }
        const gapAttr = node.attributes.find(
          (attr) => attr.type === 'JSXAttribute' && attr.name.name === 'gap',
        );
        if (!gapAttr) {
          return;
        }
        const step = getNumericValue(gapAttr);
        const tailwind = step === null ? undefined : SPACER_TO_TAILWIND[step];
        const gapClass = tailwind === undefined ? null : `gap-${tailwind}`;
        const classAttr = getClassNameAttribute(node);
        const classLiteral =
          classAttr && classAttr.value && classAttr.value.type === 'Literal'
            ? classAttr.value
            : null;
        const hasSpread = node.attributes.some(
          (attr) => attr.type === 'JSXSpreadAttribute',
        );
        const hasGapClass =
          classLiteral &&
          String(classLiteral.value)
            .split(/\s+/)
            .some((t) => GAP_CLASS.test(t));

        // Remove the attribute together with the whitespace before it.
        const removeGap = (fixer) =>
          fixer.removeRange([
            sourceCode.getTokenBefore(gapAttr).range[1],
            gapAttr.range[1],
          ]);

        let fix = null;
        if (gapClass && !hasSpread && !hasGapClass) {
          if (classLiteral) {
            // Keep the attribute's own quotes and text: JSX strings have no
            // escapes, so re-serialising could change or break the value.
            const raw = sourceCode.getText(classLiteral);
            const quote = raw[0];
            const rest = raw.slice(1, -1).trimStart();
            fix = (fixer) => [
              removeGap(fixer),
              fixer.replaceText(
                classLiteral,
                `${quote}${gapClass}${rest ? ` ${rest}` : ''}${quote}`,
              ),
            ];
          } else if (!classAttr) {
            fix = (fixer) =>
              fixer.replaceText(gapAttr, `className="${gapClass}"`);
          }
        }

        context.report({
          node: gapAttr,
          messageId: 'noStackGap',
          data: { hint: gapClass ? `: gap={${step}} is ${gapClass}` : '' },
          fix,
        });
      },
    };
  },
};
