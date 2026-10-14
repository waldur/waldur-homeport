/**
 * ESLint rule: state colours come from the status matrix, not the raw ramps.
 *
 * packages/design-tokens/src/css/semantic/status.css defines one slot per
 * intent and job — --status-{success,warning,danger,neutral}-{bg,border,solid,fg}
 * — with each -fg checked for WCAG AA against its surfaces in both themes
 * (statusContrast.test.ts). A raw ramp class such as `bg-success-50` or
 * `text-error-600` bypasses all of that: it needs its own `dark:` twin to
 * work in dark mode, nothing checks its contrast, and it drifts from every
 * other badge, banner and alert as soon as the matrix is tuned.
 *
 * The matrix has named utilities (tailwind/theme.css), named like Bootstrap
 * 5.3's:
 *
 *   bg-success-50 dark:bg-success-900   →  bg-success-subtle
 *   text-error-700                       →  text-danger
 *   border-error-300                     →  border-danger-subtle
 *   bg-error-600                         →  bg-danger
 *
 * A deliberate step outside the matrix (a tile tint a step stronger than -bg,
 * a halo ring) needs an eslint-disable with the reason.
 *
 * The arbitrary form of a slot that has a named utility
 * (`text-[var(--status-danger-fg)]`) is reported too, and autofixed.
 */

const RAW_STATUS =
  /^(?:[\w-]+:)*(?:bg|text|border|ring|outline|fill|stroke|divide|decoration|from|via|to|shadow|accent|caret|placeholder)-(success|warning|error)-\d{2,3}(?:\/\d+)?$/;

const INTENT = { success: 'success', warning: 'warning', error: 'danger' };

const ARBITRARY =
  /^((?:[\w[\]&-]+:)*!?)(text|bg|border)-\[var\(--status-(success|warning|danger|neutral)-(fg|bg|solid|border)\)\]$/;

/** The named utility for a utility prefix and matrix slot, where there is one. */
const NAMED = {
  'text:fg': (intent) => `text-${intent}`,
  'bg:solid': (intent) => intent !== 'neutral' && `bg-${intent}`,
  'bg:bg': (intent) => `bg-${intent}-subtle`,
  'border:solid': (intent) => intent !== 'neutral' && `border-${intent}`,
  'border:border': (intent) =>
    intent !== 'neutral' && `border-${intent}-subtle`,
};

/** `dark:text-[var(--status-danger-fg)]` → `dark:text-danger`, or null. */
const namedFor = (token) => {
  const m = ARBITRARY.exec(token);
  if (!m) return null;
  const [, variants, prefix, intent, slot] = m;
  const named = NAMED[`${prefix}:${slot}`]?.(intent);
  return named ? variants + named : null;
};

const tokensOf = (node) =>
  (node.type === 'Literal' ? node.value : node.value.cooked)
    .split(/\s+/)
    .filter(Boolean);

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Use the status matrix tokens (--status-*) instead of raw success/warning/error ramp utilities',
      category: 'Best Practices',
      recommended: true,
    },
    schema: [],
    messages: {
      raw:
        '"{{ token }}" is a raw ramp step. Use the {{ intent }} slot of the status matrix ' +
        '(text-danger, bg-danger, bg-danger-subtle, border-danger-subtle, …; tailwind/theme.css), ' +
        'which adapts to dark mode and is contrast-checked.',
      arbitrary: 'Use the named utility "{{ named }}" for "{{ token }}".',
    },
    fixable: 'code',
  },

  create(context) {
    const { sourceCode } = context;
    const check = (node) => {
      const tokens = tokensOf(node);
      const token = tokens.find((t) => RAW_STATUS.test(t));
      if (token) {
        context.report({
          node,
          messageId: 'raw',
          data: { token, intent: INTENT[RAW_STATUS.exec(token)[1]] },
        });
      }
      const replacements = [...new Set(tokens)]
        .map((arbitrary) => [arbitrary, namedFor(arbitrary)])
        .filter(([, named]) => named);
      // Every report rewrites the whole string, so one --fix pass is enough
      // (ESLint applies one of several overlapping fixes per pass).
      const fixed = replacements.reduce(
        (text, [arbitrary, named]) =>
          text.replaceAll(
            new RegExp(
              `(?<=^|[\\s'"\`}])${arbitrary.replace(/[[\]()|\\.*+?^$-]/g, '\\$&')}(?=$|[\\s'"\`$])`,
              'g',
            ),
            named,
          ),
        sourceCode.getText(node),
      );
      for (const [arbitrary, named] of replacements) {
        context.report({
          node,
          messageId: 'arbitrary',
          data: { token: arbitrary, named },
          fix: (fixer) => fixer.replaceText(node, fixed),
        });
      }
    };

    return {
      Literal(node) {
        if (typeof node.value === 'string') check(node);
      },
      TemplateElement: check,
    };
  },
};
