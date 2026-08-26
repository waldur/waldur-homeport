/**
 * ESLint rule catching Bootstrap button styling applied by hand to a native
 * element — `<button className="btn btn-danger">`.
 *
 * `no-direct-bootstrap-button` only inspects imports, so this shape, which
 * imports nothing at all, used to pass lint in silence. It is the easy path
 * precisely because it needs no import, so it is the case that slips through.
 *
 * What it loses is behaviour, not only visual consistency: BaseButton supplies
 * the pending spinner, the `disabledReason` tooltip and the variant design
 * tokens. A raw `<button disabled>` is inertly disabled with nothing explaining
 * why, and a raw `btn btn-danger` paints Bootstrap's own colours next to a
 * portal that is otherwise on the tokens.
 *
 * Reported as a warning: the tree still has well over a hundred of these and
 * converting each one is a per-screen judgement rather than a mechanical swap.
 * The rule is here to steer new code; the count can be driven down before this
 * is promoted to an error.
 */

import { WRAPPERS } from './bootstrap-button-wrappers.js';
import {
  getClassNameAttribute,
  getClassNameTokens,
  getNativeElementName,
} from './class-name-tokens.js';

// The wrappers themselves render a native element carrying `btn`.
//
// `Link` is here for the same reason: its `buttonVariant` prop is the project's
// sanctioned link-as-button, so the `btn` class it composes is the abstraction
// rather than a hand-rolled instance of it. Without the entry the warning would
// be unfixable — the only "fix" is deleting the prop — and the count could never
// reach the zero this rule needs before it can be promoted to an error.
const ALLOWED_FILES = [
  'src/core/buttons/BaseButton.tsx',
  'src/core/buttons/IconButton.tsx',
  'src/core/Link.tsx',
  'src/core/SaveButton.tsx',
  'src/modal/CloseDialogButton.tsx',
  'src/table/ToolbarButton.tsx',
];

// Native elements Bootstrap's `.btn` is meaningfully applied to.
const BUTTON_ELEMENTS = new Set(['button', 'a', 'input', 'label']);

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prevent Bootstrap btn classes on native elements; use the Waldur button wrappers',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null, // The replacement depends on which wrapper the call site wants.
    schema: [],
    messages: {
      noBootstrapButtonMarkup:
        'Avoid applying Bootstrap\'s "btn" class to a native <{{ element }}>.\n' +
        '  Use a Waldur wrapper component instead:\n' +
        WRAPPERS +
        '\n  A hand-rolled button loses the pending spinner, the disabledReason\n' +
        '  tooltip and the variant design tokens that BaseButton provides.',
    },
  },

  create(context) {
    const filename = context.getFilename().replace(/\\/g, '/');
    if (ALLOWED_FILES.some((allowed) => filename.includes(allowed))) {
      return {};
    }

    return {
      JSXOpeningElement(node) {
        const element = getNativeElementName(node);
        if (!element || !BUTTON_ELEMENTS.has(element)) {
          return;
        }
        // Exact token, not a substring: `btn-close`, `text-btn` and
        // `aui-vm-order-action-btn` are not Bootstrap buttons, and matching
        // them would drown the rule in false positives.
        if (!getClassNameTokens(node).has('btn')) {
          return;
        }
        context.report({
          node: getClassNameAttribute(node) || node,
          messageId: 'noBootstrapButtonMarkup',
          data: { element },
        });
      },
    };
  },
};
