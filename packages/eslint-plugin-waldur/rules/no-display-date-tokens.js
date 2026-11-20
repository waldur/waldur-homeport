/**
 * ESLint rule forbidding display formats written as Luxon token strings:
 * `.toFormat('d LLL yyyy')`, `.toFormat('MMMM yyyy')`, `.toFormat('dd.MM.yyyy')`.
 *
 * No token string is right in every locale. Month names change grammatical
 * case with what surrounds them — MMMM is "of July" (ru июля, fi heinäkuuta),
 * right after a day and wrong on its own; LLL falls back to a bare number in
 * Lithuanian and Finnish. Numeric orders are regional (26.02.2027, 02/26/2027,
 * 2027-02-26). An Intl preset in the user's locale gets all of it right, so
 * display formatting goes through the helpers in src/core/dateUtils.ts
 * (formatDate, formatDateTime, formatMonth, formatShortMonth, formatDayMonth,
 * formatTime, …), which render presets in `getDateLocale()`.
 *
 * Machine formats stay token strings and are allowed: big-endian numeric
 * dates and times (yyyy-MM, yyyy-MM-dd HH:mm, HH:mm:ss) used as keys, API
 * values or ISO-like labels.
 *
 * The format is read from a literal, or from the `const` an identifier
 * argument names. Flagged in it, ignoring quoted literals:
 * - month or weekday names: MMM+, LLL+, E, c
 * - Luxon's localized macro tokens: D, t, T, f, F (use the helpers, which
 *   render in the date locale, rather than Settings.defaultLocale)
 * - am/pm: a
 * - a numeric date that does not start with the year (dd.MM.yyyy, MM/yyyy)
 */

import { resolveConst } from '../lib/const-value.js';

const MACRO_OR_NAME = /^(M{3,}|L{3,}|E+|c+|D+|t+|T+|f+|F+|a+)$/;

const stripLiterals = (format) => format.replace(/'[^']*'/g, '');

const tokens = (format) => stripLiterals(format).match(/([A-Za-z])\1*/g) || [];

const displayTokenIn = (format) => {
  const found = tokens(format);
  const named = found.find((token) => MACRO_OR_NAME.test(token));
  if (named) return named;
  const dateTokens = found.filter((token) => /^[yMLd]/.test(token));
  const hasYear = dateTokens.some((token) => token[0] === 'y');
  if (hasYear && dateTokens.length > 1 && dateTokens[0][0] !== 'y') {
    return dateTokens[0];
  }
  return null;
};

const staticString = (node) => {
  if (!node) return null;
  if (node.type === 'Literal' && typeof node.value === 'string') {
    return node.value;
  }
  if (node.type === 'TemplateLiteral' && node.expressions.length === 0) {
    return node.quasis.map((q) => q.value.cooked).join('');
  }
  return null;
};

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow display date formats as Luxon token strings; use the src/core/dateUtils formatters',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      displayToken:
        "'{{format}}' is a display format ('{{token}}' is locale-dependent).\n" +
        '  Token strings get grammatical case and date order wrong in other\n' +
        '  languages. Use a formatter from @/core/dateUtils (formatDate,\n' +
        '  formatDateTime, formatMonth, formatShortMonth, formatDayMonth,\n' +
        '  formatTime, …), which render Intl presets in the date locale.\n' +
        '  Machine formats (yyyy-MM, yyyy-MM-dd HH:mm) are fine.',
    },
  },

  create(context) {
    return {
      CallExpression(node) {
        const { callee } = node;
        if (
          callee.type !== 'MemberExpression' ||
          callee.computed ||
          callee.property.type !== 'Identifier' ||
          callee.property.name !== 'toFormat'
        ) {
          return;
        }
        const format = staticString(resolveConst(context, node.arguments[0]));
        if (format === null) return;
        const token = displayTokenIn(format);
        if (token) {
          context.report({
            node: node.arguments[0],
            messageId: 'displayToken',
            data: { format, token },
          });
        }
      },
    };
  },
};
