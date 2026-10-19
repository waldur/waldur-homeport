import { RETIRED_BOOTSTRAP as RETIRED_RADIUS } from 'eslint-plugin-waldur/rules/enforce-border-radius-tokens.js';
import { RETIRED_BOOTSTRAP_COLORS } from 'eslint-plugin-waldur/rules/no-bootstrap-color-utility.js';
import { getLayoutReplacement } from 'eslint-plugin-waldur/rules/no-bootstrap-layout-utility.js';
import { RETIRED_UTILITY_PATTERNS } from 'eslint-plugin-waldur/rules/no-retired-bootstrap-utility.js';
import { getFontSizeReplacement } from 'eslint-plugin-waldur/rules/require-font-size-scale.js';
import { RETIRED_WEIGHTS } from 'eslint-plugin-waldur/rules/require-weight-scale.js';
import parser from 'postcss-selector-parser';
import stylelint from 'stylelint';

export const ruleName = 'waldur/no-retired-class-selectors';

const messages = stylelint.utils.ruleMessages(ruleName, {
  rejected: (className, replacement) =>
    `Do not target retired class \`.${className}\`${
      replacement ? ` (replaced by ${replacement} in markup)` : ''
    }. Add a semantic hook class to the element instead.`,
});

const colorSet = new Set(RETIRED_BOOTSTRAP_COLORS);

/**
 * Returns { replacement: string | null } if the class name is retired,
 * or null if it is valid.
 */
export function checkRetiredClass(name) {
  const layout = getLayoutReplacement(name);
  if (layout) return { replacement: layout };

  const fontSize = getFontSizeReplacement(name);
  if (fontSize) return { replacement: fontSize };

  if (colorSet.has(name)) return { replacement: null };

  if (RETIRED_WEIGHTS[name]) return { replacement: RETIRED_WEIGHTS[name] };

  if (RETIRED_RADIUS[name]) return { replacement: RETIRED_RADIUS[name] };

  const util = RETIRED_UTILITY_PATTERNS.find(([pattern]) => pattern.test(name));
  if (util) return { replacement: util[1] };

  return null;
}

const rule = (primaryOption) => {
  return (root, result) => {
    const validOptions = stylelint.utils.validateOptions(result, ruleName, {
      actual: primaryOption,
    });
    if (!validOptions || !primaryOption) return;

    root.walkRules((ruleNode) => {
      if (!ruleNode.selector || ruleNode.selector.startsWith('@')) return;

      // Preserve character offsets while preventing parser errors on Sass interpolation
      const sanitizedSelector = ruleNode.selector.replace(/#\{[^}]*\}/g, (m) =>
        '_'.repeat(m.length),
      );

      try {
        parser((selectors) => {
          selectors.walkClasses((classNode) => {
            const found = checkRetiredClass(classNode.value);
            if (found) {
              const index = classNode.sourceIndex;
              const endIndex = index + classNode.value.length + 1;
              stylelint.utils.report({
                message: messages.rejected(classNode.value, found.replacement),
                node: ruleNode,
                index,
                endIndex,
                result,
                ruleName,
              });
            }
          });
        }).processSync(sanitizedSelector);
      } catch {
        // Fall back gracefully if a custom SCSS construct fails selector parsing
      }
    });
  };
};

rule.ruleName = ruleName;
rule.messages = messages;

export default rule;
