/**
 * `JSON.stringify` omits properties whose value is `undefined`, and DRF's
 * `ModelSerializer.update()` only assigns keys that are present in the payload.
 * So `field: value || undefined` inside a request body means "when the user
 * clears this field, send nothing" — the update succeeds, reports success, and
 * silently keeps the old value. This holds for PUT as much as for PATCH.
 *
 * The fix is almost always to send an explicit empty value instead: `''` for a
 * `CharField(blank=True)`, `null` for a nullable column, or the column default
 * for a non-blankable field that has one.
 *
 * Omitting a key is occasionally deliberate — leaving a write-only secret
 * untouched, for example. Those cases should carry an eslint-disable comment
 * stating why, which is the point of the rule: make the intent explicit.
 */

const BODY_VARIABLE_NAME = /^(body|payload|.*Data)$/;

const isUndefined = (node) =>
  node && node.type === 'Identifier' && node.name === 'undefined';

/** `x || undefined`, `x ?? undefined`, `cond ? x : undefined`. */
const collapsesToUndefined = (value) => {
  if (!value) {
    return false;
  }
  if (value.type === 'LogicalExpression') {
    return (
      (value.operator === '||' || value.operator === '??') &&
      isUndefined(value.right)
    );
  }
  if (value.type === 'ConditionalExpression') {
    return isUndefined(value.consequent) || isUndefined(value.alternate);
  }
  return false;
};

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow collapsing a request body field to undefined, which drops the key and makes clearing the field a silent no-op.',
      category: 'Possible Errors',
      recommended: true,
    },
    schema: [],
    messages: {
      undefinedInBody:
        '"{{field}}" collapses to undefined, so the key is dropped from the request body and clearing this field silently keeps the old value. ' +
        'Send an explicit empty value instead: "" for a blank-able text column, null for a nullable one, or the column default. ' +
        'If omitting the key is deliberate (e.g. leaving a secret untouched), add an eslint-disable comment explaining why.',
    },
  },
  create(context) {
    const reportBodyObject = (objectExpression) => {
      for (const property of objectExpression.properties) {
        if (property.type !== 'Property') {
          continue;
        }
        if (!collapsesToUndefined(property.value)) {
          continue;
        }
        const field =
          property.key.type === 'Identifier'
            ? property.key.name
            : property.key.value;
        context.report({
          node: property,
          messageId: 'undefinedInBody',
          data: { field },
        });
      }
    };

    return {
      // body: { ... } passed straight into an SDK call
      'Property[key.name="body"] > ObjectExpression'(node) {
        reportBodyObject(node);
      },
      // const body / payload / providerData = { ... }
      VariableDeclarator(node) {
        if (
          node.id.type === 'Identifier' &&
          BODY_VARIABLE_NAME.test(node.id.name) &&
          node.init &&
          node.init.type === 'ObjectExpression'
        ) {
          reportBodyObject(node.init);
        }
      },
    };
  },
};
