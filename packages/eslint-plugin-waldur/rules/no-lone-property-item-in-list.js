/**
 * ESLint rule: prohibit a lone property item in a PropertyList.
 *
 * <PropertyList> is an HTML definition list (<dl>) designed for multiple
 * key-value pairs or property items. Placing only a single lone property item
 * inside a PropertyList is an anti-pattern:
 * - It adds unnecessary description list markup, grid styles, and borders
 *   for a single item.
 * - In many cases, it represents a misuse of PropertyList as an ad-hoc layout
 *   wrapper for a single switch, button, or form control.
 *
 * For a single row, use direct Tailwind CSS (e.g. flex layout) or merge it
 * into an adjacent PropertyList.
 */

const DEFAULT_LISTS = new Set(['PropertyList']);
const DEFAULT_ITEMS = new Set(['PropertyItem', 'PropertyList.Item']);
const TRANSPARENT_ELEMENTS = new Set([
  'Fragment',
  'React.Fragment',
  'EditFieldProvider',
]);

const elementName = (name) => {
  if (!name) return null;
  if (name.type === 'JSXIdentifier') return name.name;
  if (name.type === 'JSXMemberExpression')
    return `${elementName(name.object)}.${name.property.name}`;
  return null;
};

const isPropertyItem = (name, customItems) => {
  if (!name) return false;
  if (DEFAULT_ITEMS.has(name)) return true;
  if (customItems?.has(name)) return true;
  if (name.endsWith('Property') && name !== 'Property') return true;
  if (name.endsWith('EditField')) return true;
  return false;
};

const isTransparentElement = (name, customTransparent) => {
  if (!name) return false;
  if (TRANSPARENT_ELEMENTS.has(name)) return true;
  if (customTransparent?.has(name)) return true;
  return false;
};

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prohibit a lone property item in a PropertyList',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [
      {
        type: 'object',
        properties: {
          lists: { type: 'array', items: { type: 'string' } },
          items: { type: 'array', items: { type: 'string' } },
          transparent: { type: 'array', items: { type: 'string' } },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      lonePropertyItem:
        'This <{{name}}> is the only property item in <{{list}}>.\n' +
        '  A {{list}} is meant to display multiple properties; for a single item, use direct Tailwind CSS or merge with an adjacent list.',
    },
  },
  create(context) {
    const listNames = new Set([
      ...DEFAULT_LISTS,
      ...(context.options[0]?.lists ?? []),
    ]);
    const customItems = context.options[0]?.items
      ? new Set(context.options[0].items)
      : null;
    const customTransparent = context.options[0]?.transparent
      ? new Set(context.options[0].transparent)
      : null;

    return {
      JSXElement(node) {
        const listName = elementName(node.openingElement.name);
        if (!listNames.has(listName)) return;

        let isDynamic = false;
        const collectedItems = [];

        const analyzeNode = (n) => {
          if (!n || isDynamic) return 0;

          if (n.type === 'JSXText') {
            if (n.value.trim() === '') return 0;
            // Non-empty text in list: treat as dynamic content
            isDynamic = true;
            return 0;
          }

          if (n.type === 'JSXEmptyExpression') {
            return 0;
          }

          if (n.type === 'JSXFragment') {
            return analyzeSequence(n.children);
          }

          if (n.type === 'JSXElement') {
            const elName = elementName(n.openingElement.name);
            if (isTransparentElement(elName, customTransparent)) {
              return analyzeSequence(n.children);
            }
            if (isPropertyItem(elName, customItems)) {
              collectedItems.push({ node: n, name: elName });
              return 1;
            }
            // Unknown component (e.g. <ReviewDetails />) which might render
            // multiple rows
            isDynamic = true;
            return 0;
          }

          if (n.type === 'JSXExpressionContainer') {
            return analyzeNode(n.expression);
          }

          if (
            n.type === 'TSAsExpression' ||
            n.type === 'TSNonNullExpression' ||
            n.type === 'TSSatisfiesExpression'
          ) {
            return analyzeNode(n.expression);
          }

          if (n.type === 'LogicalExpression') {
            if (n.operator === '&&') {
              return analyzeNode(n.right);
            }
            if (n.operator === '||' || n.operator === '??') {
              const leftMax = analyzeNode(n.left);
              const rightMax = analyzeNode(n.right);
              return Math.max(leftMax, rightMax);
            }
            isDynamic = true;
            return 0;
          }

          if (n.type === 'ConditionalExpression') {
            const consequentMax = analyzeNode(n.consequent);
            const alternateMax = analyzeNode(n.alternate);
            return Math.max(consequentMax, alternateMax);
          }

          if (n.type === 'ArrayExpression') {
            return analyzeSequence(n.elements);
          }

          if (n.type === 'Literal') {
            if (n.value === null || typeof n.value === 'boolean') {
              return 0;
            }
            if (typeof n.value === 'string' && n.value.trim() === '') {
              return 0;
            }
            isDynamic = true;
            return 0;
          }

          if (n.type === 'Identifier' && n.name === 'undefined') {
            return 0;
          }

          // Any other expression (.map(), {children}, variable references, function calls)
          isDynamic = true;
          return 0;
        };

        const analyzeSequence = (sequence) => {
          let sum = 0;
          for (const item of sequence) {
            sum += analyzeNode(item);
            if (isDynamic) return 0;
          }
          return sum;
        };

        const maxItems = analyzeSequence(node.children);

        if (!isDynamic && maxItems === 1 && collectedItems.length > 0) {
          for (const item of collectedItems) {
            context.report({
              node: item.node.openingElement,
              messageId: 'lonePropertyItem',
              data: {
                name: item.name,
                list: listName,
              },
            });
          }
        }
      },
    };
  },
};
