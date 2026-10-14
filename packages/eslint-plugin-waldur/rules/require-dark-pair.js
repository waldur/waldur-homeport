/**
 * ESLint rule: a physical colour needs a dark-mode counterpart.
 *
 * A ramp step (`bg-gray-100`, `text-brand-600`), `white`/`black`, a hex or a
 * raw `var(--color-*-N)` / `var(--brand-N)` is the same colour in both themes
 * (packages/design-tokens/src/css/primitives/colors.css: every ramp is
 * physical). Without a `dark:` partner it lands on the dark surfaces as is: a
 * white sticky header, a near-white tint under light text, brand-600 text at
 * 2.9:1. The semantic utilities (`bg-primary`, `text-secondary`,
 * `bg-brand-subtle`, `text-brand`, the status matrix's `text-danger`, …)
 * change with the theme, so prefer those; otherwise pair the step with its
 * dark mirror in the same class list (`ring-brand-50 dark:ring-brand-900`).
 *
 * The class list is everything static that reaches one element: a className
 * attribute, a cn()/clsx()/twMerge() call, a class-map entry, a variable.
 * A `dark:` utility for the same property, under the same other variants
 * (`hover:`, `group-hover:`, …), counts as the partner.
 *
 * Allowed without a partner, since they read the same in both themes:
 * - a solid fill: `bg-*` at step 400 or stronger (`bg-info-600`,
 *   `bg-[var(--brand-600)]`);
 * - white or black text on a solid fill: on one of those, on a status solid
 *   (`bg-danger`) or on a `--bg-*-solid` role.
 *
 * Anything else deliberate (a logo's own colour) needs an eslint-disable
 * with the reason.
 */

import { CLASS_HELPERS, notAClassList } from './class-name-tokens.js';

// The design-token ramps (colorRamps.css) plus Tailwind's default palette,
// which src/tailwind.css still imports.
const RAMPS = [
  'brand|gray-dark|gray|error|warning|success|info|moss',
  'red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose',
  'slate|zinc|neutral|stone',
].join('|');
const PROPERTY =
  'bg|text|border(?:-[trblxyse])?|ring-offset|ring|outline|fill|stroke|divide|decoration|from|via|to|shadow|accent|caret|placeholder';

/** prefix, then the colour; `/opacity` allowed. */
const PHYSICAL = new RegExp(
  `^(${PROPERTY})-(` +
    `(?:${RAMPS})-(\\d{2,3})` +
    `|white|black` +
    `|\\[(?:#[0-9a-fA-F]{3,8}|rgba?\\([^\\]]*\\)` +
    `|var\\(--(?:color-(?:${RAMPS})-(\\d{2,3})|brand-(\\d{2,3})|brand-color|color-white|color-black)\\))\\]` +
    `)(?:\\/\\d+)?$`,
);

/** A theme-stable solid fill other than a raw step: the status solids, --bg-*-solid. */
const NAMED_SOLID =
  /^bg-(?:success|warning|danger|\[var\(--(?:bg-[\w-]*solid|status-\w+-solid)\)\])$/;

const HINTS = [
  [/^bg-white$/, 'bg-primary'],
  [/^bg-gray-(25|50)$/, 'bg-secondary'],
  [/^bg-gray-100$/, 'bg-tertiary'],
  [/^text-(?:gray-|\[var\(--color-gray-)/, 'text-primary … text-senary'],
  [
    /^border(?:-[trblxyse])?-(?:gray-|\[var\(--color-gray-)/,
    'border-secondary',
  ],
  [/^bg-(?:brand-50|\[var\(--brand-50\)\])$/, 'bg-brand-subtle'],
  [/^bg-info-50$/, 'bg-info-subtle'],
  [/^text-info-/, 'text-info'],
  [
    /^(?:text|border(?:-[trblxyse])?|outline)-(?:brand-\d|\[var\(--(?:brand-\d+|brand-color)\)\])/,
    'text-brand / border-brand / outline-brand',
  ],
  [/^text-(?:\[var\(--color-)?error-/, 'text-danger'],
  [
    /^text-(?:\[var\(--color-)?(success|warning)-/,
    'text-success / text-warning',
  ],
];

/** Split `dark:hover:bg-x/50` into its variants and its utility. */
const parse = (token) => {
  const body = token.replace(/^!/, '');
  // A `:` inside an arbitrary value (`[--x:var(...)]`) is not a variant separator.
  const bracket = body.indexOf('[');
  const head = bracket === -1 ? body : body.slice(0, bracket);
  const cut = head.lastIndexOf(':');
  const variants = cut === -1 ? [] : body.slice(0, cut).split(':');
  return { variants, utility: body.slice(cut + 1) };
};

const stepOf = (m) => Number(m[3] ?? m[4] ?? m[5] ?? NaN);

const isSolidFill = (utility) => {
  if (NAMED_SOLID.test(utility)) return true;
  const m = PHYSICAL.exec(utility);
  return Boolean(m && m[1] === 'bg' && stepOf(m) >= 400);
};

/** Wrappers a class list passes through on its way to its element. */
const UP = new Set([
  'ConditionalExpression',
  'LogicalExpression',
  'JSXExpressionContainer',
  'TemplateLiteral',
  'ArrayExpression',
  'BinaryExpression',
  'TSAsExpression',
  'TSSatisfiesExpression',
]);

const isClassHelperCall = (node) =>
  node?.type === 'CallExpression' &&
  CLASS_HELPERS.test(node.callee.name ?? node.callee.property?.name ?? '');

/** The node whose static strings form one class list. */
const groupRoot = (node) => {
  let current = node;
  for (;;) {
    const parent = current.parent;
    if (!parent) return current;
    if (UP.has(parent.type) || isClassHelperCall(parent)) {
      current = parent;
      continue;
    }
    // cn({ 'bg-x': cond }) — the object belongs to the helper call.
    if (
      parent.type === 'Property' &&
      parent.parent?.type === 'ObjectExpression' &&
      isClassHelperCall(parent.parent.parent)
    ) {
      current = parent.parent.parent;
      continue;
    }
    return current;
  }
};

/** Static strings under a class-list root, each with the node to report on. */
const stringsUnder = (root, visitorKeys) => {
  const out = [];
  const visit = (node) => {
    if (!node || typeof node.type !== 'string') return;
    if (node.type === 'Literal' && typeof node.value === 'string') {
      out.push({ node, text: node.value });
    } else if (node.type === 'TemplateElement') {
      out.push({ node, text: node.value.cooked ?? node.value.raw });
    }
    for (const key of visitorKeys[node.type] ?? []) {
      const child = node[key];
      if (Array.isArray(child)) child.forEach(visit);
      else visit(child);
    }
  };
  visit(root);
  return out;
};

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require a dark: counterpart for physical colour utilities (ramp steps, white/black, hex)',
      category: 'Best Practices',
      recommended: true,
    },
    schema: [],
    messages: {
      unpaired:
        '"{{ token }}" is the same colour in both themes. Use {{ hint }}, or pair it with a ' +
        'dark: counterpart in the same class list (docs/design-tokens.md).',
    },
  },

  create(context) {
    const { sourceCode } = context;
    const seen = new WeakSet();

    const check = (node) => {
      const stringNode = node.type === 'TemplateElement' ? node.parent : node;
      if (notAClassList(stringNode)) return;
      const root = groupRoot(stringNode);
      if (seen.has(root)) return;
      seen.add(root);

      const strings = stringsUnder(root, sourceCode.visitorKeys);
      const tokens = strings.flatMap(({ node: n, text }) =>
        text
          .split(/\s+/)
          .filter(Boolean)
          .map((token) => ({ token, node: n, ...parse(token) })),
      );
      const key = (variants) =>
        variants
          .filter((v) => v !== 'dark')
          .sort()
          .join(':');
      const darkPartners = new Set(
        tokens
          .filter((t) => t.variants.includes('dark'))
          .map((t) => {
            const m = /^([a-z]+(?:-[trblxyse](?=-))?)/.exec(t.utility);
            return m ? `${key(t.variants)}|${m[1]}` : null;
          })
          .filter(Boolean),
      );
      const solidBackground = tokens.some(
        (t) => !t.variants.includes('dark') && isSolidFill(t.utility),
      );

      for (const t of tokens) {
        if (t.variants.includes('dark')) continue;
        const m = PHYSICAL.exec(t.utility);
        if (!m) continue;
        const property = m[1];
        if (property === 'bg' && isSolidFill(t.utility)) continue;
        if (
          property === 'text' &&
          /^text-(?:white|black)$/.test(t.utility) &&
          solidBackground
        ) {
          continue;
        }
        if (darkPartners.has(`${key(t.variants)}|${property}`)) continue;
        const hint =
          HINTS.find(([re]) => re.test(t.utility))?.[1] ?? 'a semantic utility';
        context.report({
          node: t.node,
          messageId: 'unpaired',
          data: { token: t.token, hint },
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
