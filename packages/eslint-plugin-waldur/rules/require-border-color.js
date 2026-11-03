/**
 * ESLint rule: a bare `border` names its colour.
 *
 * Bootstrap's `.border` was `border: 1px solid var(--border-secondary)
 * !important`, so `border` alone drew the secondary line. Bootstrap no longer
 * generates it (#478): `border` is Tailwind's, which sets only the width, and
 * without a colour class the line falls back to `currentColor`, the text
 * colour. The rule reports a bare `border` with no border colour beside it and
 * autofixes it to `border border-secondary`, the line it drew before.
 *
 * In a JSX `className` or a class helper call (`cn()`, `classNames()`, …),
 * every string counts (both arms of a conditional, template expressions,
 * every argument): a colour in any of them is enough, and a list that also
 * takes classes from another function call (`cellClass(cell)`) is not
 * reported, since that call may supply the colour. Elsewhere, the string itself must carry the colour; strings that hold a
 * name rather than a class list are skipped, and so are prose (a capitalised
 * word) and a lone `'border'` outside a class helper, which is a name (a
 * colour slot, a variant) more often than a class list.
 */

import {
  CLASS_HELPERS,
  getClassNameAttribute,
  notAClassList,
} from './class-name-tokens.js';

const NOT_A_COLOR =
  /^(?:\d+|[xytblrse]|solid|dashed|dotted|double|hidden|none|collapse|separate|spacing(?:-.*)?|opacity-.*)$/;

const ARBITRARY_WIDTH =
  /^\[(?:length:|[\d.]+(?:px|rem|em)?\]|thin|medium|thick)/;

/** The utility with its variants (`hover:`, `dark:`) stripped. */
const baseUtility = (token) => {
  let depth = 0;
  let start = 0;
  for (let i = 0; i < token.length; i += 1) {
    if (token[i] === '[') depth += 1;
    else if (token[i] === ']') depth -= 1;
    else if (token[i] === ':' && depth === 0) start = i + 1;
  }
  return token.slice(start);
};

/** True for a border colour such as `border-brand`, `hover:border-[var(--x)]`. */
export const isBorderColor = (token) => {
  const match = /^!?border-(?:[xytblrse]-)?(.+?)!?$/.exec(baseUtility(token));
  if (!match) return false;
  const suffix = match[1];
  if (suffix.startsWith('[')) return !ARBITRARY_WIDTH.test(suffix);
  return !NOT_A_COLOR.test(suffix);
};

/** A colour that applies in every state, not only under a variant. */
const isBaseBorderColor = (token) =>
  isBorderColor(token) && baseUtility(token) === token;

const splitTokens = (text) => text.split(/\s+/).filter(Boolean);

const literalText = (node) =>
  node.type === 'Literal' ? node.value : node.value.cooked;

const isStringNode = (node) =>
  (node.type === 'Literal' && typeof node.value === 'string') ||
  node.type === 'TemplateElement';

/** True when `node` takes classes from a call other than a class helper. */
const hasComputedClasses = (node) => {
  if (!node || typeof node.type !== 'string') return false;
  if (
    node.type === 'CallExpression' &&
    !CLASS_HELPERS.test(node.callee.name ?? '')
  )
    return true;
  return Object.keys(node).some((key) => {
    if (key === 'parent') return false;
    const value = node[key];
    if (Array.isArray(value)) return value.some(hasComputedClasses);
    return value && typeof value.type === 'string'
      ? hasComputedClasses(value)
      : false;
  });
};

/** String literals and template quasis anywhere under `node`. */
const collectStrings = (node, out = []) => {
  if (!node || typeof node.type !== 'string') return out;
  if (isStringNode(node)) {
    out.push(node);
    return out;
  }
  for (const key of Object.keys(node)) {
    if (key === 'parent') continue;
    const value = node[key];
    if (Array.isArray(value))
      value.forEach((child) => collectStrings(child, out));
    else if (value && typeof value.type === 'string')
      collectStrings(value, out);
  }
  return out;
};

// A bare `border` token inside a literal's source text: bounded by
// whitespace, quotes, backticks or template-literal braces.
const BARE_BORDER = /(^|[\s'"`}])border(?=[\s'"`$]|$)/g;

const hasBareBorder = (node) =>
  splitTokens(literalText(node) ?? '').includes('border');

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require a border colour next to a bare `border`, which no longer draws Bootstrap’s secondary line',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      missingColor:
        '"border" sets only the width, so the line takes the text colour. ' +
        'Add a border colour (usually border-secondary, the line Bootstrap’s .border drew).',
    },
  },

  create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode();
    const handled = new WeakSet();

    const report = (node, strings) =>
      context.report({
        node,
        messageId: 'missingColor',
        fix: (fixer) =>
          strings
            .filter(hasBareBorder)
            .map((s) =>
              fixer.replaceText(
                s,
                sourceCode
                  .getText(s)
                  .replace(BARE_BORDER, '$1border border-secondary'),
              ),
            ),
      });

    const inClassHelper = (node) => {
      const call = node.parent;
      return (
        call?.type === 'CallExpression' &&
        CLASS_HELPERS.test(call.callee.name ?? '')
      );
    };

    const checkString = (node) => {
      if (handled.has(node) || !hasBareBorder(node)) return;
      if (notAClassList(node.type === 'Literal' ? node : node.parent)) return;
      const tokens = splitTokens(literalText(node));
      if (tokens.some((t) => /^[A-Z]/.test(t))) return;
      if (
        node.type === 'Literal' &&
        tokens.length === 1 &&
        !inClassHelper(node)
      )
        return;
      if (!tokens.some(isBaseBorderColor)) report(node, [node]);
    };

    // One class list: a className attribute's value or a helper's arguments.
    const checkList = (reportNode, value) => {
      const strings = collectStrings(value);
      if (strings.every((s) => handled.has(s))) return;
      strings.forEach((s) => handled.add(s));
      if (!strings.some(hasBareBorder) || hasComputedClasses(value)) return;
      const tokens = strings.flatMap((s) => splitTokens(literalText(s)));
      if (!tokens.some(isBaseBorderColor)) report(reportNode, strings);
    };

    return {
      JSXOpeningElement(node) {
        const attribute = getClassNameAttribute(node);
        if (attribute) checkList(attribute, attribute.value);
      },
      CallExpression(node) {
        if (CLASS_HELPERS.test(node.callee.name ?? '')) {
          checkList(node, { type: 'Arguments', arguments: node.arguments });
        }
      },
      Literal(node) {
        if (typeof node.value === 'string') checkString(node);
      },
      TemplateElement: checkString,
    };
  },
};
