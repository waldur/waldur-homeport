/**
 * ESLint rule catching Bootstrap button styling applied by hand to a native
 * element — `<button className="btn btn-danger">`.
 *
 * The `no-restricted-imports` entries for `Button`/`DropdownButton`
 * (eslint.config.js) only inspect imports, so this shape, which imports
 * nothing at all, used to pass lint in silence. It is the easy path
 * precisely because it needs no import, so it is the case that slips through.
 *
 * What it loses is behaviour, not only visual consistency: BaseButton supplies
 * the pending spinner, the `disabledReason` tooltip and the variant design
 * tokens. A raw `<button disabled>` is inertly disabled with nothing explaining
 * why, and a raw `btn btn-danger` paints Bootstrap's own colours next to a
 * portal that is otherwise on the tokens.
 *
 * Reported as an error: the tree has no remaining instances, so any new one is
 * a regression. `Link` no longer composes a `btn` class either — it builds its
 * classes from `buttonVariants()` — so the rule needs no allowlist.
 */

import { WRAPPERS } from './bootstrap-button-wrappers.js';
import {
  getClassNameAttribute,
  getClassNameTokens,
  getNativeElementName,
} from './class-name-tokens.js';

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
