/**
 * ESLint rule forbidding reads of Bootstrap's `--bs-*` custom properties in
 * TS/TSX: `var(--bs-border-color)` in a style prop, a Tailwind arbitrary
 * value, or a `getCssVar('--bs-body-color')` lookup.
 *
 * The `--bs-*` variables are generated from the Metronic SCSS, so they are
 * not part of the design-token architecture: the gray ramp behind them is
 * theme-inverted in dark mode, some (`--bs-tertiary-bg`, `--bs-secondary-bg`,
 * `--bs-secondary-color`, `--bs-card-bg`) are never defined at all, and they
 * disappear with Bootstrap. Read the design tokens instead:
 * packages/design-tokens/src/css, see docs/design-tokens.md → "Retiring --bs-*".
 *
 * Replacements:
 * - --bs-border-color            → --border-secondary
 * - --bs-body-bg                 → --bg-primary
 * - --bs-body-color              → --text-primary
 * - --bs-primary                 → --brand-color
 * - --bs-primary-N               → --brand-N
 * - --bs-primary-rgb             → --brand-color-rgb
 * - --bs-gray-100 / -200         → --bg-tertiary / --bg-quaternary
 *   (a line: -200 / -400       → --border-divider / --border-divider-strong)
 * - --bs-gray-50                → --bg-secondary
 * - --bs-gray-400 / -500 / -600 / -700
 *                               → --text-quinary / -quaternary / -tertiary / -secondary
 * - --bs-dark                   → --text-primary
 * - --bs-success / -danger / -active-warning
 *                               → --status-success-fg / -danger-fg / -warning-fg
 */

const REPLACEMENTS = {
  'border-color': '--border-secondary',
  'body-bg': '--bg-primary',
  'body-color': '--text-primary',
  primary: '--brand-color',
  'primary-rgb': '--brand-color-rgb',
  dark: '--text-primary',
  'gray-50': '--bg-secondary',
  'gray-100': '--bg-tertiary',
  'gray-200': '--bg-quaternary (--border-divider for a line)',
  'gray-400': '--text-quinary (--border-divider-strong for a line)',
  'gray-500': '--text-quaternary',
  'gray-600': '--text-tertiary',
  'gray-700': '--text-secondary',
  success: '--status-success-fg',
  danger: '--status-danger-fg',
  'active-warning': '--status-warning-fg',
};

// Not preceded by a name character, so `--my--bs-thing` is not a match.
const BS_VAR = /(?<![\w-])--bs-([a-z0-9-]+)/g;

const suggestion = (name) => {
  if (REPLACEMENTS[name]) {
    return `Use ${REPLACEMENTS[name]}.`;
  }
  const brandStep = /^primary-(\d+)$/.exec(name);
  if (brandStep) {
    return `Use --brand-${brandStep[1]}.`;
  }
  return 'Use a design token from packages/design-tokens (docs/design-tokens.md).';
};

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow Bootstrap --bs-* custom properties; use the design tokens',
      category: 'Best Practices',
    },
    schema: [],
    messages: {
      noBootstrapVar:
        '`--bs-{{name}}` is a Bootstrap variable, not a design token. {{hint}}',
    },
  },

  create(context) {
    const check = (node, text) => {
      for (const match of text.matchAll(BS_VAR)) {
        context.report({
          node,
          messageId: 'noBootstrapVar',
          data: { name: match[1], hint: suggestion(match[1]) },
        });
      }
    };

    return {
      Literal(node) {
        if (typeof node.value === 'string') {
          check(node, node.value);
        }
      },
      TemplateElement(node) {
        check(node, node.value.cooked ?? node.value.raw);
      },
    };
  },
};
