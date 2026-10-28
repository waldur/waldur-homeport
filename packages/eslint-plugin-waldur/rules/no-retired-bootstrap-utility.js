/**
 * ESLint rule: Bootstrap utilities that are no longer generated.
 *
 * Bootstrap's utility API generated every value at every breakpoint whether
 * or not anything used it: about half the compiled Metronic stylesheet was
 * rules nothing could match. src/styles/bootstrap/_utilities.scss
 * now drops the utilities nothing used and the breakpoint variants of those
 * only ever used at the base size. A retired name compiles to nothing, so this
 * rule reports it with the Tailwind class to use instead.
 *
 * Each pattern names only classes Tailwind does not define itself (Tailwind
 * has its own float-*, so Bootstrap's float utility is dropped but not
 * reported); src/tailwindBootstrapColors.test.ts checks both directions.
 */

import {
  RETIRED_SPACING_FAMILIES,
  isBootstrapOnlySpacing,
  toTailwindSpacing,
} from './bootstrap-spacing.js';
import { notAClassList } from './class-name-tokens.js';

const BP = '(?:sm|md|lg|xl|xxl)';

/**
 * [pattern, the replacement to suggest].
 * @type {Array<[RegExp, string]>}
 */
export const RETIRED_UTILITY_PATTERNS = [
  [/^vw-100$/, 'w-screen'],
  [/^min-vw-100$/, 'min-w-screen'],
  [/^vh-100$/, 'h-screen'],
  [/^min-vh-100$/, 'min-h-screen'],
  [/^align-content-\w+$/, 'content-* (content-center, content-between, …)'],
  [/^ls-n?\d+$/, 'tracking-* (tracking-tight, tracking-wide, …)'],
  [
    /^lh-(?:0|1|sm|base|lg|xl|xxl)$/,
    'leading-* (leading-none, leading-tight, leading-normal, …)',
  ],
  // Breakpoint variants of utilities only ever used at the base size.
  [
    new RegExp(`^(?:w|mw|h|mh|min-w|min-h|fs)-${BP}-[\\w.-]+$`),
    'a Tailwind breakpoint variant (lg:w-1/2, md:min-h-[100px])',
  ],
  [
    new RegExp(`^flex-${BP}-(?:fill|shrink-[01])$`),
    'a Tailwind breakpoint variant (lg:flex-1, lg:shrink-0)',
  ],
  // Fixed-size and max-size utilities retired in #473.
  [/^mw-[\w.-]+$/, 'max-w-* (max-w-[175px], max-w-full, …)'],
  [/^mh-[\w.-]+$/, 'max-h-* (max-h-[300px], max-h-full, …)'],
  [
    /^(?:w|min-w|h|min-h)-\d+px$/,
    'a Tailwind arbitrary size (w-[125px], min-w-[125px], …)',
  ],
  // The header's icon button (custom/_nav.scss), now waldur-ui's IconButton.
  [/^btn-nav-item$/, "waldur-ui's IconButton"],
  // svg-icon retired in #530; use bare Phosphor / SVGR components with size props or Tailwind size-* utilities.
  [
    /^svg-icon(?:-[\w.-]+)?$/,
    'bare Phosphor or SVGR icon with size prop or Tailwind size-* (size-5, size-6) and text-* for color',
  ],
  // symbol retired in #560; use Avatar from waldur-ui, or Tailwind size-* and rounded-* utilities.
  [
    /^symbol(?:-[\w.-]+)?$/,
    'Avatar from waldur-ui, or Tailwind size-* and rounded-* utilities',
  ],
  // timeline retired in #561; use waldur-ui Timeline component or Tailwind flex utilities.
  [
    /^timeline(?:-(?:item|line|icon|content|border-dashed))?$/,
    'waldur-ui Timeline primitive (<Timeline>, <TimelineItem>, <TimelineConnector>, <TimelineIcon>, <TimelineContent>) or Tailwind flex layout',
  ],
  // spinners retired in #474; use waldur-ui LoadingSpinner component.
  [/^spinner-(?:border|grow)(?:-sm)?$/, "waldur-ui's LoadingSpinner component"],
];

/**
 * Spacing moved to Tailwind's scale (#477) and kept its plain names (`mb-4`
 * is Tailwind's now), so only the spellings Tailwind lacks are reported:
 * `mb-md-4`, `mt-n2`, `gap-8px`, each with its Tailwind class.
 */
const retiredSpacing = (token) => {
  if (!isBootstrapOnlySpacing(token)) return undefined;
  const hint = toTailwindSpacing(token, RETIRED_SPACING_FAMILIES);
  return hint ? [null, hint] : undefined;
};

const retired = (token) =>
  RETIRED_UTILITY_PATTERNS.find(([pattern]) => pattern.test(token)) ??
  retiredSpacing(token);

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Report Bootstrap utility classes the Metronic build no longer generates',
      category: 'Best Practices',
      recommended: true,
    },
    schema: [],
    messages: {
      retired:
        '"{{ token }}" is a Bootstrap utility that is no longer generated, so it paints nothing. Use {{ hint }}.',
    },
  },

  create(context) {
    const check = (node, text) => {
      for (const token of text.split(/\s+/)) {
        const hit = token && retired(token);
        if (hit) {
          context.report({
            node,
            messageId: 'retired',
            data: { token, hint: hit[1] },
          });
        }
      }
    };
    return {
      Literal(node) {
        if (typeof node.value === 'string' && !notAClassList(node)) {
          check(node, node.value);
        }
      },
      TemplateElement(node) {
        if (!notAClassList(node.parent)) {
          check(node, node.value.cooked ?? node.value.raw);
        }
      },
    };
  },
};
