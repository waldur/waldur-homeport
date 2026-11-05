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
  // Card's parts carry a data-slot, so there is a selector to point at
  // rather than a hook class to add.
  rejectedCard: (className, replacement) =>
    `Do not target retired card class \`.${className}\`: nothing emits it, so this rule selects nothing. ${
      replacement
        ? `Target ${replacement} instead.`
        : 'waldur-ui Card has no equivalent part — delete the rule.'
    } See docs/class-names-and-data-attributes.md.`,
});

const colorSet = new Set(RETIRED_BOOTSTRAP_COLORS);

/**
 * The card classes, which no stylesheet emits any more: waldur-ui's Card
 * draws every card and marks its parts with `data-slot` / `data-variant` /
 * `data-bordered` instead (#476 retired Bootstrap's `_card.scss` partial,
 * Metronic's `components/_card.scss` and the `.card*` rules in
 * `legacy/_base.scss`). A rule that still targets one of these selects
 * nothing at all, so it is dead CSS rather than a style that merely needs
 * porting.
 *
 * Each value is what to target instead. The `$card-*` Sass variables in
 * `src/styles/legacy/_mixins.scss` hold these selectors, so a stylesheet in
 * this repo writes `#{$card-header}` rather than the attribute selector
 * itself. Spacing is not a selector at all: the parts read `--card-*`
 * custom properties (waldur-design-tokens `components/card.css`), which a
 * context rule sets, because a part's own utilities outrank anything in the
 * legacy layer.
 *
 * Only the names those three stylesheets actually defined are listed, so a
 * class of our own that merely contains "card" (`.offering-card-compact`,
 * `.compact-card-hover-action`) is untouched.
 *
 * Note this list is card-only. No other retired component family is
 * reported here yet: `.modal*`, `.nav*`, `.row`/`.col-*`, `.form-control`,
 * `.breadcrumb`, `.progress*` and `.list-group*` are all still accepted as
 * selectors, even though their ESLint counterparts (`no-bootstrap-modal`,
 * `no-bootstrap-tabs`, …) report them in markup. Each needs the same
 * check that nothing emits it any more before it can be added.
 */
const RETIRED_CARD_CLASSES = {
  // Structure: waldur-ui Card's parts, by data-slot.
  card: '`#{$card}` ([data-slot="card"])',
  'card-header': '`#{$card-header}` ([data-slot="card-header"])',
  'card-title': '`#{$card-title}` ([data-slot="card-title"])',
  'card-toolbar': '`#{$card-toolbar}` ([data-slot="card-toolbar"])',
  // Bootstrap's .card-body is CardContent, so the slot name differs.
  'card-body': '`#{$card-body}` ([data-slot="card-content"])',
  'card-footer': '[data-slot="card-footer"]',
  // Variants and flags, by the prop that sets them.
  'card-bordered': "`#{$card-bordered}` (Card's `bordered` prop)",
  'card-solid': '`#{$card-solid}` (Card\'s `variant="solid"`)',
  'card-table': '`#{$card-table}` (Card\'s `variant="table"`)',
  'card-widget': 'Card\'s `variant="widget"` ([data-variant="widget"])',
  'card-sm': 'Card\'s `size="sm"` ([data-size="sm"])',
  // Spacing: a --card-* hook on the part, not a selector.
  'card-px': 'the --card-padding-x / --card-header-px hooks',
  'card-py': 'the --card-header-py / --card-content-pt hooks',
  'card-flush': 'the --card-content-px / --card-content-pt hooks',
  'card-shadow': 'the --card-box-shadow hook',
  'card-label': 'the --card-label-gap hook',
  // Bootstrap-only parts nothing renders: no replacement to name.
  'card-subtitle': null,
  'card-text': null,
  'card-link': null,
  'card-group': null,
  'card-img': null,
  'card-img-top': null,
  'card-img-bottom': null,
  'card-img-overlay': null,
  'card-header-tabs': null,
  'card-header-pills': null,
};

/**
 * Returns { replacement: string | null } if the class name is retired,
 * or null if it is valid.
 */
export function checkRetiredClass(name) {
  if (name in RETIRED_CARD_CLASSES) {
    return { replacement: RETIRED_CARD_CLASSES[name], kind: 'card' };
  }

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
              const message =
                found.kind === 'card'
                  ? messages.rejectedCard
                  : messages.rejected;
              stylelint.utils.report({
                message: message(classNode.value, found.replacement),
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
