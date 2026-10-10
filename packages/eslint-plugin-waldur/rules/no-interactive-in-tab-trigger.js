/**
 * ESLint rule keeping interactive elements out of tab triggers.
 *
 * A `TabsTrigger` renders a `<button>`, so a `HelpIcon`, button, link or form
 * control inside it is a control inside a control: invalid HTML, a click that does two things, and a screen
 * reader that announces the inner control as part of the tab's name.
 *
 * Use the trigger's own props instead: `hint` for help text (a tooltip with a
 * question-mark icon), `tooltip` for a disabled reason, `count` for a badge.
 *
 * `TabNav` tabs are data (`items`), so this checks `TabsTrigger` only.
 */

const TRIGGERS = new Set(['TabsTrigger']);

const INTERACTIVE = new Set([
  'button',
  'a',
  'input',
  'select',
  'textarea',
  'HelpIcon',
  'WarningTip',
  'BaseButton',
  'CopyButton',
  'Link',
]);

const elementName = (node) => {
  const name = node.openingElement.name;
  if (name.type === 'JSXIdentifier') {
    return name.name;
  }
  if (name.type === 'JSXMemberExpression') {
    return name.property.name;
  }
  return null;
};

const childElements = (node) => {
  const out = [];
  const visit = (child) => {
    if (child.type === 'JSXElement') {
      out.push(child);
    } else if (child.type === 'JSXFragment') {
      child.children.forEach(visit);
    } else if (child.type === 'JSXExpressionContainer') {
      const walk = (expr) => {
        if (!expr) return;
        if (expr.type === 'JSXElement' || expr.type === 'JSXFragment') {
          visit(expr);
        } else if (expr.type === 'LogicalExpression') {
          walk(expr.right);
        } else if (expr.type === 'ConditionalExpression') {
          walk(expr.consequent);
          walk(expr.alternate);
        }
      };
      walk(child.expression);
    }
  };
  node.children.forEach(visit);
  return out;
};

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow buttons, links, HelpIcon and form controls inside tab triggers',
      category: 'Accessibility',
      recommended: true,
    },
    schema: [],
    messages: {
      nested:
        "<{{ inner }}> inside <{{ trigger }}> is a control inside the tab's own button or link. Use the trigger's `hint` (help text), `tooltip` or `count` props instead.",
    },
  },

  create(context) {
    const check = (trigger, node) => {
      for (const child of childElements(node)) {
        const inner = elementName(child);
        if (inner && INTERACTIVE.has(inner)) {
          context.report({
            node: child,
            messageId: 'nested',
            data: { trigger, inner },
          });
        }
        check(trigger, child);
      }
    };

    return {
      JSXElement(node) {
        const trigger = elementName(node);
        if (!trigger || !TRIGGERS.has(trigger)) {
          return;
        }
        check(trigger, node);
      },
    };
  },
};
