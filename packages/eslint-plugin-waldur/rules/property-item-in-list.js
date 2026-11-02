/**
 * ESLint rule: a `PropertyItem` sits in a `PropertyList`.
 *
 * Outside a list each `PropertyItem` wraps itself in its own `<dl>`, so rows
 * placed one after another read to a screen reader as a run of one-item
 * description lists, and a divided row has no grid to take its columns from.
 * Put the rows in `<PropertyList>` (`variant="summary"` for a read-only
 * summary; it lays out the same as loose rows).
 *
 * The check walks up from the item through fragments, typed property scopes
 * (`OrderProperty.Scope`), conditionals and `.map()` callbacks:
 *
 * - reaching a `PropertyList`, or a component that renders its children in
 *   one (the `wrappers` option), is fine;
 * - reaching the component's own return is fine: a component that returns
 *   rows hands them to its caller's list, which this file cannot see;
 * - reaching any other element first (a `<div>`, a dialog, a card) means the
 *   rows render in that element with no list, which is reported.
 *
 * Rows placed through a variable or a prop are not followed. A row that
 * really stands alone says so with an eslint-disable comment and the reason.
 *
 * Options: `{ wrappers: string[] }`, names of components that render their
 * children inside a list. `Name[prop]` counts only when `prop` is written,
 * `Name[!prop]` only when it is not.
 */

const ITEM_NAMES = new Set(['PropertyItem', 'PropertyList.Item']);
const FRAGMENT_NAMES = new Set(['Fragment', 'React.Fragment']);
const MAP_METHODS = new Set(['map', 'flatMap']);

const elementName = (name) => {
  if (name.type === 'JSXIdentifier') return name.name;
  if (name.type === 'JSXMemberExpression')
    return `${elementName(name.object)}.${name.property.name}`;
  return null;
};

const parseWrapper = (spec) => {
  const match = /^([\w.]+)(?:\[(!?)(\w+)\])?$/.exec(spec);
  if (!match) throw new Error(`property-item-in-list: bad wrapper "${spec}"`);
  const [, name, negated, prop] = match;
  return { name, prop, negated: negated === '!' };
};

const hasProp = (opening, prop) =>
  opening.attributes.some(
    (attr) => attr.type === 'JSXAttribute' && attr.name.name === prop,
  );

const isFunction = (node) =>
  node.type === 'ArrowFunctionExpression' || node.type === 'FunctionExpression';

// A callback passed to `.map()` / `.flatMap()`: its rows land wherever the
// call's result is rendered, so the walk continues past it.
const isMapCallback = (node) =>
  isFunction(node) &&
  node.parent.type === 'CallExpression' &&
  node.parent.arguments.includes(node) &&
  node.parent.callee.type === 'MemberExpression' &&
  !node.parent.callee.computed &&
  MAP_METHODS.has(node.parent.callee.property.name);

// Nodes that pass the rows through to their parent unchanged.
const TRANSPARENT = new Set([
  'JSXFragment',
  'ConditionalExpression',
  'LogicalExpression',
  'TSAsExpression',
  'TSNonNullExpression',
  'TSSatisfiesExpression',
]);

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require PropertyItem rows to sit inside a PropertyList',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [
      {
        type: 'object',
        properties: {
          wrappers: { type: 'array', items: { type: 'string' } },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      outsideList:
        'This PropertyItem renders inside <{{container}}> with no PropertyList, so it becomes a one-row <dl> of its own.\n' +
        '  Wrap the rows in <PropertyList> (variant="summary" for a read-only summary; it lays out the same).',
    },
  },
  create(context) {
    const wrappers = [
      { name: 'PropertyList' },
      { name: 'PropertyList.Section' },
      ...(context.options[0]?.wrappers ?? []).map(parseWrapper),
    ];
    const isWrapper = (opening) => {
      const name = elementName(opening.name);
      return wrappers.some(
        (wrapper) =>
          wrapper.name === name &&
          (!wrapper.prop || hasProp(opening, wrapper.prop) !== wrapper.negated),
      );
    };

    return {
      JSXOpeningElement(node) {
        if (!ITEM_NAMES.has(elementName(node.name))) return;
        let child = node.parent;
        for (let n = child.parent; n; child = n, n = n.parent) {
          if (n.type === 'JSXElement') {
            const name = elementName(n.openingElement.name);
            if (isWrapper(n.openingElement)) return;
            if (
              FRAGMENT_NAMES.has(name) ||
              name === 'PropertyList.Section' ||
              name === 'PropertyListSection'
            )
              continue;
            context.report({
              node,
              messageId: 'outsideList',
              data: { container: name ?? 'element' },
            });
            return;
          }
          if (n.type === 'JSXExpressionContainer') {
            // A prop value is placed by the component that takes it.
            if (n.parent.type === 'JSXAttribute') return;
            continue;
          }
          if (n.type === 'CallExpression') {
            // `.map(cb)` reached from its callback; any other call stops.
            if (!isMapCallback(child)) return;
            continue;
          }
          if (TRANSPARENT.has(n.type)) {
            // The test of a ternary or the left of `&&` is not rendered.
            if (n.type === 'ConditionalExpression' && n.test === child) return;
            continue;
          }
          if (isFunction(n)) {
            if (isMapCallback(n)) continue;
            return;
          }
          if (
            n.type === 'ReturnStatement' ||
            n.type === 'BlockStatement' ||
            n.type === 'IfStatement' ||
            n.type === 'SwitchCase' ||
            n.type === 'SwitchStatement'
          ) {
            // Inside a `.map()` callback's body the walk goes on; a
            // component's own body ends at its function, handled above.
            continue;
          }
          return;
        }
      },
    };
  },
};
