/**
 * Stylelint rule: a font-size is on the type scale.
 *
 * A `font-size` is `var(--text-xs|sm|base|lg|xl|2xl|3xl|4xl)`
 * (primitives/typography.css) or relative to the parent (`em`, `%`,
 * `inherit`, `smaller`, `larger`). A px, rem or Sass-variable size is
 * reported, naming the token it equals where there is one: rem sizes against
 * HomePort's 13px root, which shrink on phones (12px root) while the tokens
 * do not. The size inside a `font:` shorthand (`font: 600 1.077rem/1.2 …`) is
 * checked the same way.
 */

import {
  ARBITRARY_PIXELS_TO_NAMED,
  REM_TO_NAMED,
} from 'eslint-plugin-waldur/rules/require-font-size-scale.js';
import stylelint from 'stylelint';

export const ruleName = 'waldur/font-size-scale';

const SIZES = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl'];
const TOKEN = new RegExp(`^var\\(--text-(${SIZES.join('|')})\\)$`);
const RELATIVE = /^(\d*\.)?\d+(em|%)$|^(inherit|smaller|larger)$/;

/**
 * Sizes that equal a token, `{ '14px': 'sm', '1.077rem': 'sm', … }`: the same
 * table require-font-size-scale fixes TSX classes with.
 */
const EQUIVALENTS = Object.fromEntries(
  Object.entries({ ...ARBITRARY_PIXELS_TO_NAMED, ...REM_TO_NAMED }).map(
    ([size, utility]) => [size, utility.replace(/^text-/, '')],
  ),
);

const messages = stylelint.utils.ruleMessages(ruleName, {
  rejected: (value, token) =>
    `font-size "${value}" is off the type scale: use the ${
      token ? `--text-${token}` : '--text-xs … --text-4xl'
    } token, or em/% for a size relative to the parent (primitives/typography.css).`,
});

/**
 * The size in a `font:` shorthand, `600 1.077rem/1.2 var(--font-sans)` →
 * `1.077rem`: the first word that is a length, a var() (other than a
 * --font-weight-* one) or a Sass variable, before the family. undefined for a keyword (`inherit`, `menu`).
 */
export function shorthandSize(value) {
  const words = value.match(/(?:[^\s(]|\([^)]*\))+/g) ?? [];
  const size = words.find(
    (w) =>
      /^(?:[\d.]+[a-z%]+|var\(|\$)/i.test(w.split('/')[0]) &&
      !w.startsWith('var(--font-weight-'),
  );
  return size?.split('/')[0];
}

/** The token a font-size value should be, or undefined when it is fine. */
export function checkFontSize(value) {
  const v = value.trim();
  if (TOKEN.test(v) || RELATIVE.test(v)) return undefined;
  return { token: EQUIVALENTS[v] };
}

const rule = (primaryOption) => {
  return (root, result) => {
    const validOptions = stylelint.utils.validateOptions(result, ruleName, {
      actual: primaryOption,
    });
    if (!validOptions || !primaryOption) return;

    root.walkDecls(/^font(-size)?$/i, (decl) => {
      const size =
        decl.prop.toLowerCase() === 'font'
          ? shorthandSize(decl.value)
          : decl.value;
      if (size === undefined) return;
      const found = checkFontSize(size);
      if (!found) return;
      stylelint.utils.report({
        message: messages.rejected(size.trim(), found.token),
        node: decl,
        word: decl.value,
        result,
        ruleName,
      });
    });
  };
};

rule.ruleName = ruleName;
rule.messages = messages;

export default rule;
