/**
 * Shared helper for rules that inspect Bootstrap classes on native elements.
 *
 * Import-based checks (the `no-restricted-imports` entries for
 * `Button`/`DropdownButton` in eslint.config.js) only ever saw
 * `import { Button } from 'react-bootstrap'`. The thing rules using these
 * helpers are actually about — `<button className="btn btn-danger">` —
 * carries no import at all, so it slipped through. These helpers pull the
 * statically knowable class
 * tokens out of a `className` attribute so a `JSXOpeningElement` visitor can match
 * on them.
 *
 * Only static parts are collected: a template literal contributes its quasis but
 * not its expressions, and a `classNames(...)` call contributes its string
 * literals and object keys. Anything computed is invisible, which keeps the rules
 * quiet rather than guessing.
 */

/** Collect the static class tokens reachable from an expression node. */
const collectTokens = (node, tokens) => {
  if (!node) {
    return;
  }

  switch (node.type) {
    case 'Literal':
      if (typeof node.value === 'string') {
        for (const token of node.value.split(/\s+/)) {
          if (token) {
            tokens.add(token);
          }
        }
      }
      break;

    case 'JSXExpressionContainer':
      collectTokens(node.expression, tokens);
      break;

    case 'TemplateLiteral':
      // Static segments only — `${variant}` could be anything.
      for (const quasi of node.quasis) {
        for (const token of quasi.value.cooked.split(/\s+/)) {
          if (token) {
            tokens.add(token);
          }
        }
      }
      break;

    case 'ConditionalExpression':
      collectTokens(node.consequent, tokens);
      collectTokens(node.alternate, tokens);
      break;

    case 'LogicalExpression':
      collectTokens(node.left, tokens);
      collectTokens(node.right, tokens);
      break;

    case 'BinaryExpression':
      if (node.operator === '+') {
        collectTokens(node.left, tokens);
        collectTokens(node.right, tokens);
      }
      break;

    case 'ArrayExpression':
      for (const element of node.elements) {
        collectTokens(element, tokens);
      }
      break;

    case 'ObjectExpression':
      // classNames({ 'btn-danger': isDanger }) — the key is the class.
      for (const property of node.properties) {
        if (property.type !== 'Property' || property.computed) {
          continue;
        }
        if (property.key.type === 'Literal') {
          collectTokens(property.key, tokens);
        } else if (property.key.type === 'Identifier') {
          tokens.add(property.key.name);
        }
      }
      break;

    case 'CallExpression': {
      // classNames(...) / clsx(...) and friends.
      const callee = node.callee;
      const calleeName =
        callee.type === 'Identifier'
          ? callee.name
          : callee.type === 'MemberExpression' &&
              callee.property.type === 'Identifier'
            ? callee.property.name
            : null;
      if (
        calleeName === 'classNames' ||
        calleeName === 'classnames' ||
        calleeName === 'clsx'
      ) {
        for (const argument of node.arguments) {
          collectTokens(argument, tokens);
        }
      }
      break;
    }

    default:
      break;
  }
};

/**
 * Static class tokens on a JSXOpeningElement's `className` attribute.
 * Returns an empty Set when there is no className or nothing static in it.
 */
export const getClassNameTokens = (node) => {
  const tokens = new Set();
  const attribute = node.attributes.find(
    (attr) => attr.type === 'JSXAttribute' && attr.name.name === 'className',
  );
  if (attribute) {
    collectTokens(attribute.value, tokens);
  }
  return tokens;
};

/** The `className` attribute node, for reporting at the right location. */
export const getClassNameAttribute = (node) =>
  node.attributes.find(
    (attr) => attr.type === 'JSXAttribute' && attr.name.name === 'className',
  );

/** True when the element is a native DOM element (lowercase name), not a component. */
const isNativeElement = (node) =>
  node.name &&
  node.name.type === 'JSXIdentifier' &&
  /^[a-z]/.test(node.name.name);

/** Native element tag name, or null for components and member expressions. */
export const getNativeElementName = (node) =>
  isNativeElement(node) ? node.name.name : null;

export const CLASS_HELPERS = /^(?:classNames|classnames|cn|clsx|cx|twMerge)$/;
const TEST_CALLS = /^(?:it|test|describe)$/;
/** Wrappers a class list passes through on its way to an attribute. */
const PASS_THROUGH = new Set([
  'ConditionalExpression',
  'LogicalExpression',
  'JSXExpressionContainer',
  'TemplateLiteral',
]);

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
      return parent.name.name === 'variant';
    case 'Property':
      if (parent.key === child && !parent.computed) {
        const call = parent.parent?.parent;
        return !(
          call?.type === 'CallExpression' &&
          CLASS_HELPERS.test(call.callee.name ?? '')
        );
      }
      return (parent.key.name ?? parent.key.value) === 'variant';
    case 'TSLiteralType':
    case 'BinaryExpression':
    case 'SwitchCase':
      return true;
    case 'CallExpression': {
      const callee = parent.callee.object ?? parent.callee;
      return (
        parent.arguments[0] === child && TEST_CALLS.test(callee.name ?? '')
      );
    }
    default:
      return false;
  }
};
