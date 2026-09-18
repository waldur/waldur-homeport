/**
 * ESLint rule to enforce that dialog action buttons follow the standard order:
 * Dismissive / secondary actions (e.g. CloseDialogButton, Cancel) must appear first (left),
 * and primary / submission actions (e.g. SubmitButton, Save, Approve, Create) must be the
 * last (rightmost) button in the dialog footer.
 */

const BUTTON_TAGS = new Set([
  'SubmitButton',
  'CloseDialogButton',
  'CompactSubmitButton',
  'Button',
  'BaseButton',
  'ActionButton',
]);

function getTagName(node) {
  if (node.type === 'JSXElement') {
    const name = node.openingElement.name;
    if (name.type === 'JSXIdentifier') {
      return name.name;
    }
    if (name.type === 'JSXMemberExpression') {
      return `${name.object.name}.${name.property.name}`;
    }
  }
  return null;
}

function getAttribute(node, attrName) {
  if (!node.openingElement || !node.openingElement.attributes) return null;
  return (
    node.openingElement.attributes.find(
      (attr) => attr.type === 'JSXAttribute' && attr.name?.name === attrName,
    ) || null
  );
}

function getAttributeValue(node, attrName) {
  const attr = getAttribute(node, attrName);
  if (!attr || !attr.value) return null;
  if (attr.value.type === 'Literal') return attr.value.value;
  if (attr.value.type === 'JSXExpressionContainer') {
    if (attr.value.expression.type === 'Literal') {
      return attr.value.expression.value;
    }
    if (
      attr.value.expression.type === 'CallExpression' &&
      attr.value.expression.callee?.name === 'translate' &&
      attr.value.expression.arguments?.[0]?.type === 'Literal'
    ) {
      return attr.value.expression.arguments[0].value;
    }
  }
  return null;
}

function getChildText(node) {
  if (!node.children) return '';
  for (const child of node.children) {
    if (child.type === 'JSXText') {
      const trimmed = child.value.trim();
      if (trimmed) return trimmed;
    }
    if (
      child.type === 'JSXExpressionContainer' &&
      child.expression.type === 'CallExpression' &&
      child.expression.callee?.name === 'translate' &&
      child.expression.arguments?.[0]?.type === 'Literal'
    ) {
      return child.expression.arguments[0].value;
    }
  }
  return '';
}

function classifyButton(node) {
  const tagName = getTagName(node);
  if (!tagName || !BUTTON_TAGS.has(tagName)) return null;

  const variant = getAttributeValue(node, 'variant');
  const label =
    getAttributeValue(node, 'label') ||
    getAttributeValue(node, 'title') ||
    getChildText(node) ||
    '';
  const labelLower = String(label).toLowerCase();
  const btnType = getAttributeValue(node, 'type');

  // Back button (in wizards or multi-step dialogs)
  if (
    labelLower.includes('back') ||
    (tagName === 'SubmitButton' &&
      variant === 'tertiary' &&
      btnType === 'button')
  ) {
    return { type: 'BACK', node, tagName, label };
  }

  // Dismiss button (Cancel / Close)
  if (tagName === 'CloseDialogButton') {
    // Rare exception: CloseDialogButton repurposed with variant="primary" / label="Save"
    if (variant === 'primary' || labelLower === 'save') {
      return { type: 'PRIMARY', node, tagName, label: label || 'Save' };
    }
    return { type: 'DISMISS', node, tagName, label: label || 'Cancel' };
  }

  if (
    variant === 'tertiary' ||
    variant === 'secondary' ||
    String(variant).startsWith('outline')
  ) {
    if (
      labelLower === 'cancel' ||
      labelLower === 'close' ||
      labelLower === 'dismiss' ||
      labelLower === 'discard'
    ) {
      return { type: 'DISMISS', node, tagName, label };
    }
  }

  // Primary / Submit button
  if (tagName === 'SubmitButton') {
    return { type: 'PRIMARY', node, tagName, label: label || 'Submit' };
  }

  if (tagName === 'CompactSubmitButton') {
    if (variant === 'danger') {
      return { type: 'REJECT', node, tagName, label: label || 'Reject' };
    }
    return { type: 'PRIMARY', node, tagName, label: label || 'Submit' };
  }

  if (variant === 'primary' || variant === 'success' || btnType === 'submit') {
    return { type: 'PRIMARY', node, tagName, label: label || tagName };
  }

  return null;
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce that modal dialog action buttons place dismissive actions first and primary submission/approval actions last (rightmost).',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      invalidButtonOrder:
        "Dialog action button order is invalid: '{{primaryButton}}' must be the last (rightmost) action, placed after '{{dismissButton}}'.",
    },
  },

  create(context) {
    function checkButtonSequence(buttons, parentNode) {
      if (buttons.length < 2) return;

      // Find if any PRIMARY button appears before a DISMISS button
      for (let i = 0; i < buttons.length; i++) {
        const b1 = buttons[i];
        if (b1.type !== 'PRIMARY') continue;

        for (let j = i + 1; j < buttons.length; j++) {
          const b2 = buttons[j];
          if (b2.type === 'DISMISS') {
            // Found violation: PRIMARY is before DISMISS
            context.report({
              node: b1.node,
              messageId: 'invalidButtonOrder',
              data: {
                primaryButton: b1.label
                  ? `${b1.tagName} (${b1.label})`
                  : b1.tagName,
                dismissButton: b2.label
                  ? `${b2.tagName} (${b2.label})`
                  : b2.tagName,
              },
              fix(fixer) {
                // Check if b1 and b2 are siblings under parentNode.children
                if (parentNode && parentNode.children) {
                  const children = parentNode.children.filter(
                    (c) => c.type === 'JSXElement',
                  );
                  const idx1 = children.indexOf(b1.node);
                  const idx2 = children.indexOf(b2.node);
                  // Safely swap if they are direct element siblings
                  if (idx1 !== -1 && idx2 !== -1 && idx2 === idx1 + 1) {
                    const text1 = context.sourceCode.getText(b1.node);
                    const text2 = context.sourceCode.getText(b2.node);
                    return [
                      fixer.replaceText(b1.node, text2),
                      fixer.replaceText(b2.node, text1),
                    ];
                  }
                }
                return null;
              },
            });
          }
        }
      }
    }

    function inspectContainer(containerNode) {
      if (!containerNode) return;

      // If container is a fragment or element, check its immediate or nested buttons
      if (
        containerNode.type === 'JSXFragment' ||
        containerNode.type === 'JSXElement'
      ) {
        const buttons = [];
        for (const child of containerNode.children) {
          if (child.type === 'JSXElement') {
            const classified = classifyButton(child);
            if (classified) {
              buttons.push(classified);
            } else {
              // Could be a nested wrapper like <div className="d-flex ...">
              inspectContainer(child);
            }
          } else if (child.type === 'JSXExpressionContainer') {
            inspectContainer(child.expression);
          }
        }
        checkButtonSequence(buttons, containerNode);
      } else if (containerNode.type === 'ConditionalExpression') {
        inspectContainer(containerNode.consequent);
        inspectContainer(containerNode.alternate);
      }
    }

    return {
      JSXAttribute(node) {
        if (node.name?.name === 'footer' && node.value) {
          if (node.value.type === 'JSXExpressionContainer') {
            inspectContainer(node.value.expression);
          }
        }
      },

      JSXElement(node) {
        const tagName = getTagName(node);
        if (tagName === 'Modal.Footer') {
          inspectContainer(node);
        }
      },
    };
  },
};
