/**
 * Recognising a property of a JSX `style` object.
 *
 * Shared by the rules that guard one declaration each against being set
 * inline, where it outranks every stylesheet and every utility:
 * require-font-size-scale (`fontSize`), require-weight-scale (`fontWeight`),
 * enforce-border-radius-tokens (`borderRadius`) and no-static-inline-style
 * (everything else that has a utility).
 */

/**
 * Is this `Property` part of a JSX `style` value?
 *
 * Walks out through the object and any conditional wrapping it, so a property
 * inside `style={cond ? { … } : { … }}` or `style={cond && { … }}` counts,
 * while the same object passed to a chart or a mock does not.
 *
 * @param {object} property - a `Property` node
 * @returns {boolean}
 */
export const inJsxStyle = (property) => {
  let node = property.parent;
  while (
    node &&
    [
      'ObjectExpression',
      'ConditionalExpression',
      'LogicalExpression',
      'JSXExpressionContainer',
    ].includes(node.type)
  ) {
    node = node.parent;
  }
  return node?.type === 'JSXAttribute' && node.name.name === 'style';
};

/**
 * The static value of a style property, or `null` when it has none.
 *
 * A literal string or number, or a template literal with no expressions. A
 * number comes back as a number, so a caller can tell `width: 16` (16px) from
 * `width: '16'`. Everything computed at runtime — an identifier, a call, a
 * template with a hole, a conditional — returns `null`, which is what keeps
 * these rules off the inline styles that have to stay.
 *
 * @param {object} property - a `Property` node
 * @returns {string | number | null}
 */
export const staticStyleValue = (property) => {
  if (property.type !== 'Property' || property.computed) return null;
  const { value } = property;
  if (value.type === 'Literal') {
    return typeof value.value === 'string' || typeof value.value === 'number'
      ? value.value
      : null;
  }
  // A negative number is a unary minus over a literal, not a literal.
  if (
    value.type === 'UnaryExpression' &&
    (value.operator === '-' || value.operator === '+') &&
    value.argument.type === 'Literal' &&
    typeof value.argument.value === 'number'
  ) {
    return value.operator === '-'
      ? -value.argument.value
      : value.argument.value;
  }
  if (value.type === 'TemplateLiteral' && value.expressions.length === 0) {
    return value.quasis[0].value.cooked ?? value.quasis[0].value.raw;
  }
  return null;
};

/**
 * Does the object holding this property spread something into itself?
 *
 * A spread makes the merge order decide which declaration wins, so moving one
 * of the object's literals to a class can change what applies. These are the
 * forwarded-`style` components (`FeaturedIcon`, `Avatar`, `Tooltip`), which
 * are correct as they are, so a rule that rewrites declarations leaves the
 * whole object alone.
 *
 * @param {object} property - a `Property` node
 * @returns {boolean}
 */
export const styleObjectHasSpread = (property) =>
  property.parent?.type === 'ObjectExpression' &&
  property.parent.properties.some((p) => p.type === 'SpreadElement');

/** The property's name, for both `{ width: 1 }` and `{ 'width': 1 }`. */
export const styleKeyName = (property) =>
  property.key?.type === 'Identifier'
    ? property.key.name
    : property.key?.type === 'Literal'
      ? String(property.key.value)
      : null;
