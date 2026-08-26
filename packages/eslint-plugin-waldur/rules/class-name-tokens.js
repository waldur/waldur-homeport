/**
 * Shared helper for rules that inspect Bootstrap classes on native elements.
 *
 * The rules named after markup (`no-direct-bootstrap-button`, `prefer-alert-item`)
 * originally only saw `import { Button } from 'react-bootstrap'`. The thing they
 * are actually about — `<button className="btn btn-danger">` — carries no import
 * at all, so it slipped through. These helpers pull the statically knowable class
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
export const isNativeElement = (node) =>
  node.name &&
  node.name.type === 'JSXIdentifier' &&
  /^[a-z]/.test(node.name.name);

/** Native element tag name, or null for components and member expressions. */
export const getNativeElementName = (node) =>
  isNativeElement(node) ? node.name.name : null;
