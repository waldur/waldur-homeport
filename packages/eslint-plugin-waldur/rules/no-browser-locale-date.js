/**
 * ESLint rule forbidding native date formatting in the browser's locale:
 * `date.toLocaleDateString()`, `toLocaleTimeString(undefined, …)`,
 * `new Intl.DateTimeFormat(getUserLocale(), …)`.
 *
 * With no locale (or `undefined`) the browser's language is used, not the one
 * the user picked in the app; `getUserLocale()` is the UI language, but plain
 * English there is US month-first. Dates take their locale from
 * `getDateLocale()` (waldur-i18n-runtime) — better still, a formatter from
 * src/core/dateUtils (formatDate, formatDateTime, formatTime, …).
 *
 * Checked:
 * - toLocaleDateString / toLocaleTimeString: always dates.
 * - toLocaleString: with date options (month, day, hour, …) or on a
 *   `new Date(…)`, since it also formats numbers.
 * - Intl.DateTimeFormat (with or without `new`).
 * The locale argument is reported when it is missing, `undefined`, or a call
 * to `getUserLocale()` — directly or through a `const` holding one.
 */

import { resolveConst } from '../lib/const-value.js';

const DATE_OPTION_KEYS = new Set([
  'dateStyle',
  'timeStyle',
  'weekday',
  'era',
  'year',
  'month',
  'day',
  'hour',
  'minute',
  'second',
  'timeZoneName',
]);

const isBrowserLocale = (context, given) => {
  const arg = resolveConst(context, given);
  return (
    !arg ||
    (arg.type === 'Identifier' && arg.name === 'undefined') ||
    (arg.type === 'CallExpression' &&
      arg.callee.type === 'Identifier' &&
      arg.callee.name === 'getUserLocale')
  );
};

/** `new Date(…)` as the receiver: a date even with no options passed. */
const isNewDate = (node) =>
  node.type === 'NewExpression' &&
  node.callee.type === 'Identifier' &&
  node.callee.name === 'Date';

const hasDateOptions = (arg) =>
  arg?.type === 'ObjectExpression' &&
  arg.properties.some(
    (p) =>
      p.type === 'Property' &&
      p.key.type === 'Identifier' &&
      DATE_OPTION_KEYS.has(p.key.name),
  );

const isIntlDateTimeFormat = (callee) =>
  callee.type === 'MemberExpression' &&
  callee.object.type === 'Identifier' &&
  callee.object.name === 'Intl' &&
  callee.property.type === 'Identifier' &&
  callee.property.name === 'DateTimeFormat';

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        "Disallow native date formatting in the browser's locale; use getDateLocale() or the src/core/dateUtils formatters",
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      browserLocale:
        '{{call}} formats in the browser locale (or US English), not the\n' +
        '  language picked in the app. Use a formatter from @/core/dateUtils\n' +
        '  (formatDate, formatDateTime, formatTime, …), or pass getDateLocale()\n' +
        '  from waldur-i18n-runtime. See docs/date-formatting.md.',
    },
  },

  create(context) {
    const check = (node) => {
      const { callee, arguments: args } = node;
      let call = null;
      if (isIntlDateTimeFormat(callee)) {
        call = 'Intl.DateTimeFormat';
      } else if (
        callee.type === 'MemberExpression' &&
        !callee.computed &&
        callee.property.type === 'Identifier'
      ) {
        const name = callee.property.name;
        if (name === 'toLocaleDateString' || name === 'toLocaleTimeString') {
          call = name;
        } else if (
          name === 'toLocaleString' &&
          (hasDateOptions(resolveConst(context, args[1])) ||
            isNewDate(callee.object))
        ) {
          call = name;
        }
      }
      if (call && isBrowserLocale(context, args[0])) {
        context.report({
          node: args[0] || node,
          messageId: 'browserLocale',
          data: { call },
        });
      }
    };
    return { CallExpression: check, NewExpression: check };
  },
};
