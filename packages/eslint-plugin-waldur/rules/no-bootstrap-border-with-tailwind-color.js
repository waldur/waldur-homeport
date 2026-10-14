/**
 * ESLint rule: no Bootstrap border class next to a Tailwind border colour.
 *
 * Bootstrap's `.border` (and `.border-top`/`-bottom`/`-start`/`-end`) is
 * `border: 1px solid var(--bs-border-color) !important`, in the `bootstrap`
 * cascade layer. An `!important` declaration in an earlier layer beats every
 * Tailwind utility, important or not — so in
 *
 *   <div className="border rounded border-brand" />
 *
 * `border-brand` compiles but never paints: the border stays Bootstrap's gray.
 * `border border-transparent hover:border-secondary` is always visible and
 * never changes on hover, for the same reason.
 *
 * Use Tailwind's width utility instead, which sets only the width and lets the
 * colour class win: `border-[1px]` (the bare `border` class name is taken by
 * Bootstrap), `border-t-[1px]`, … The fix does this when the same string also
 * sets a base border colour; otherwise the element would fall back to
 * `currentColor` in the states that set none, so it is reported without one —
 * add an explicit colour (usually `border-secondary`) and switch by hand.
 *
 * Border colours Bootstrap itself emits (`border-success`, `border-gray-200`,
 * …) are not reported: they are `!important` in the same layer and win anyway.
 */

import { getClassNameAttribute } from './class-name-tokens.js';

const BOOTSTRAP_BORDER = {
  border: 'border-[1px]',
  'border-top': 'border-t-[1px]',
  'border-bottom': 'border-b-[1px]',
  'border-start': 'border-s-[1px]',
  'border-end': 'border-e-[1px]',
};

// $theme-colors keys Bootstrap still emits as .border-* (_variables.scss),
// plus its width and side classes.
const BOOTSTRAP_BORDER_COLORS = new Set([
  'white',
  'light',
  'dark',
  'dark-always',
  'success',
  'success-600',
  'success-700',
  'info',
  'warning',
  'danger',
  'danger-600',
  'gray',
  'gray-100',
  'gray-200',
  'gray-300',
  'gray-400',
  'gray-500',
  'gray-600',
  'gray-700',
  'gray-800',
  'gray-900',
  'top',
  'bottom',
  'start',
  'end',
]);

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

const hasVariant = (token) => baseUtility(token) !== token;

/** True for a Tailwind-only border colour such as `border-brand`, `hover:border-[var(--x)]`. */
export const isTailwindBorderColor = (token) => {
  const match = /^border-(?:[xytblrse]-)?(.+)$/.exec(baseUtility(token));
  if (!match) return false;
  const suffix = match[1];
  if (suffix.startsWith('[')) return !ARBITRARY_WIDTH.test(suffix);
  return !NOT_A_COLOR.test(suffix) && !BOOTSTRAP_BORDER_COLORS.has(suffix);
};

const splitTokens = (text) => text.split(/\s+/).filter(Boolean);

const bootstrapTokens = (tokens) =>
  tokens.filter((token) => token in BOOTSTRAP_BORDER);

// Whole-token match inside a literal's source text: bounded by whitespace,
// quotes, backticks or template-literal braces.
const tokenPattern = (token) =>
  new RegExp(`(^|[\\s'"\`}])${token}(?=[\\s'"\`$]|$)`, 'g');

const replaceBootstrapTokens = (text) =>
  Object.entries(BOOTSTRAP_BORDER).reduce(
    (result, [from, to]) => result.replace(tokenPattern(from), `$1${to}`),
    text,
  );

const literalText = (node) =>
  node.type === 'Literal' ? node.value : node.value.cooked;

const isStringNode = (node) =>
  (node.type === 'Literal' && typeof node.value === 'string') ||
  node.type === 'TemplateElement';

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

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        "Disallow Bootstrap's !important border classes next to a Tailwind border colour",
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      clash:
        '"{{ bootstrap }}" is Bootstrap\'s `border … !important`, so "{{ color }}" never paints. ' +
        'Use "{{ replacement }}" for the width.',
      clashNoFix:
        '"{{ bootstrap }}" is Bootstrap\'s `border … !important`, so "{{ color }}" never paints. ' +
        'Use "{{ replacement }}" for the width, and give every state an explicit border colour ' +
        '(usually border-secondary), or it falls back to currentColor.',
    },
  },

  create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode();
    const handled = new WeakSet();

    // Fixable only when one string carries both the Bootstrap class and a base
    // (non-variant) Tailwind border colour, so the colour is always present.
    const fixableStrings = (strings) =>
      strings.filter((node) => {
        const tokens = splitTokens(literalText(node));
        return (
          bootstrapTokens(tokens).length > 0 &&
          tokens.some((t) => isTailwindBorderColor(t) && !hasVariant(t))
        );
      });

    const report = (node, tokens, strings) => {
      const bootstrap = bootstrapTokens(tokens)[0];
      const color = tokens.find(isTailwindBorderColor);
      const withBootstrap = strings.filter(
        (s) => bootstrapTokens(splitTokens(literalText(s))).length > 0,
      );
      const canFix =
        withBootstrap.length > 0 &&
        fixableStrings(withBootstrap).length === withBootstrap.length;
      context.report({
        node,
        messageId: canFix ? 'clash' : 'clashNoFix',
        data: { bootstrap, color, replacement: BOOTSTRAP_BORDER[bootstrap] },
        fix: canFix
          ? (fixer) =>
              withBootstrap.map((s) =>
                fixer.replaceText(
                  s,
                  replaceBootstrapTokens(sourceCode.getText(s)),
                ),
              )
          : null,
      });
    };

    const clashes = (tokens) =>
      bootstrapTokens(tokens).length > 0 && tokens.some(isTailwindBorderColor);

    const checkString = (node) => {
      if (handled.has(node)) return;
      const tokens = splitTokens(literalText(node));
      if (clashes(tokens)) report(node, tokens, [node]);
    };

    return {
      JSXOpeningElement(node) {
        const attribute = getClassNameAttribute(node);
        if (!attribute) return;
        const strings = collectStrings(attribute.value);
        strings.forEach((s) => handled.add(s));
        // Every string in the attribute, including template-literal
        // expressions and both arms of a conditional: any of them can end up
        // in the class list next to the Bootstrap class.
        const tokens = strings.flatMap((s) => splitTokens(literalText(s)));
        if (clashes(tokens)) report(attribute, tokens, strings);
      },
      Literal(node) {
        if (typeof node.value === 'string') checkString(node);
      },
      TemplateElement: checkString,
    };
  },
};
