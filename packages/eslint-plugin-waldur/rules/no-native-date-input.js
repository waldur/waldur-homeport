/**
 * ESLint rule forbidding native date/time inputs:
 * `<input type="date">` and its siblings (`datetime-local`, `time`, `month`,
 * `week`), whether on a raw <input>, a react-bootstrap <Form.Control> or any
 * other component that forwards `type`.
 *
 * Native pickers can't be styled with the design tokens (the popup is
 * browser chrome, with its own colours and no dark theme), render in a
 * different format per browser and OS locale (a 12-hour clock in en-US next
 * to fields showing 24-hour times), and are uneven across browsers — desktop
 * Firefox has no month or week input at all and shows a plain text box.
 * Every such input in the app was replaced by the waldur-ui pickers; this
 * rule keeps it that way.
 *
 * Replacements (see docs/forms.md → "Date & Time Pickers"):
 * - date            → DatePicker (waldur-ui), or DateField/DateGroup in forms
 * - datetime-local  → DatePicker with `enableTime`, or DateTimeField/DateTimeGroup
 * - month           → MonthPicker (waldur-ui)
 * - time            → TimeInput (waldur-ui), or TimeSelectField in forms
 * - week            → DatePicker/DateRangePicker
 * For state kept as strings, `parseDateValue` reads them and `toIsoDate` /
 * `toIsoMonth` write them back.
 */

const REPLACEMENTS = {
  date: 'DatePicker (waldur-ui), or DateField / DateGroup inside a form',
  'datetime-local':
    'DatePicker with enableTime (waldur-ui), or DateTimeField / DateTimeGroup inside a form',
  month: 'MonthPicker (waldur-ui)',
  time: 'TimeInput (waldur-ui), or TimeSelectField inside a form',
  week: 'DatePicker or DateRangePicker (waldur-ui)',
};

/** String values an attribute expression can take, as far as they're static. */
function staticStrings(node) {
  if (!node) return [];
  switch (node.type) {
    case 'Literal':
      return typeof node.value === 'string' ? [node.value] : [];
    case 'TemplateLiteral':
      return node.expressions.length === 0
        ? [node.quasis.map((q) => q.value.cooked).join('')]
        : [];
    case 'JSXExpressionContainer':
      return staticStrings(node.expression);
    case 'ConditionalExpression':
      return [
        ...staticStrings(node.consequent),
        ...staticStrings(node.alternate),
      ];
    case 'LogicalExpression':
      return [...staticStrings(node.left), ...staticStrings(node.right)];
    default:
      return [];
  }
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow native date/time inputs (type="date", "datetime-local", "time", "month", "week"); use the waldur-ui pickers',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      nativeDateInput:
        'Native <input type="{{type}}"> is not allowed: it ignores the design\n' +
        '  tokens and dark theme, formats per browser locale, and is missing in\n' +
        '  some browsers. Use {{replacement}} instead — see docs/forms.md,\n' +
        '  "Date & Time Pickers". String state: parseDateValue / toIsoDate /\n' +
        '  toIsoMonth from waldur-ui.',
    },
  },

  create(context) {
    return {
      JSXAttribute(node) {
        if (node.name.type !== 'JSXIdentifier' || node.name.name !== 'type') {
          return;
        }
        for (const value of staticStrings(node.value)) {
          const type = value.toLowerCase();
          if (REPLACEMENTS[type]) {
            context.report({
              node,
              messageId: 'nativeDateInput',
              data: { type, replacement: REPLACEMENTS[type] },
            });
          }
        }
      },
    };
  },
};
