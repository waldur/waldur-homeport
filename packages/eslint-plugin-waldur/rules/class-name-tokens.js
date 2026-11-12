/**
 * Shared helpers for rules that inspect class tokens: locating a `className`
 * attribute, recognising class-list helpers (`cn`, `clsx`, …), and telling a
 * class list apart from a string that merely holds a name.
 */

/** The `className` attribute node, for reporting at the right location. */
export const getClassNameAttribute = (node) =>
  node.attributes.find(
    (attr) => attr.type === 'JSXAttribute' && attr.name.name === 'className',
  );

export const CLASS_HELPERS =
  /^(?:classNames|classnames|cn|clsx|cx|twMerge|cva)$/;
/** Wrappers a class list passes through on its way to an attribute. */
const PASS_THROUGH = new Set([
  'ConditionalExpression',
  'LogicalExpression',
  'JSXExpressionContainer',
  'TemplateLiteral',
]);

const NON_CLASS_PROPS =
  /^(?:variant|data-slot|data-testid|title|label|description|component|message|summary|text|name|id|value|placeholder|key|url|path|type|role|shape)$/;

/**
 * A string that holds a name, not a class list: `variant="text-danger"` (a
 * BaseButton variant), `{ 'text-danger': 'Error' }`, `tone === 'text-danger'`,
 * `type Tone = 'text-danger'`, a test title.
 */
export const notAClassList = (node) => {
  let child = node;
  let parent = node.parent;
  while (parent && PASS_THROUGH.has(parent.type)) {
    child = parent;
    parent = parent.parent;
  }
  if (!parent) return false;
  switch (parent.type) {
    // Class lists also travel in props like backgroundColor="bg-info".
    case 'JSXAttribute':
      return (
        NON_CLASS_PROPS.test(parent.name.name) ||
        Boolean(parent.name.name?.startsWith?.('aria-'))
      );
    case 'Property':
      if (parent.key === child && !parent.computed) {
        const call = parent.parent?.parent;
        return !(
          call?.type === 'CallExpression' &&
          CLASS_HELPERS.test(call.callee.name ?? '')
        );
      }
      return NON_CLASS_PROPS.test(
        String(parent.key.name ?? parent.key.value ?? ''),
      );
    case 'TSLiteralType':
    case 'BinaryExpression':
    case 'SwitchCase':
      return true;
    case 'CallExpression': {
      const callee = parent.callee.object ?? parent.callee;
      const name = callee.name ?? callee.property?.name ?? '';
      return !CLASS_HELPERS.test(name);
    }
    default:
      return false;
  }
};
