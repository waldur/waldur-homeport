/**
 * ESLint rule steering a ModalDialog's action buttons towards its `footer`
 * prop instead of being hand-rolled inside its children.
 *
 * ModalDialog renders `footer` as a real Modal.Footer — a sibling of
 * Modal.Body inside .modal-content. A SubmitButton/CloseDialogButton
 * rendered as part of ModalDialog's *children* instead lands nested inside
 * .modal-body: wrong DOM structure (a footer inside a body), and it misses
 * whatever spacing/border-top .modal-footer itself provides. Found live
 * repeatedly as a hand-rolled `d-flex justify-content-end` (or an
 * explicit `<div className="modal-footer">`, sometimes even duplicating
 * `.modal-body` alongside it) sitting inside the <form> instead.
 *
 * The fix in every case so far has been the same shape: the <form> wraps
 * the whole <ModalDialog> (not the other way around) so a native submit
 * button passed via `footer` is still a real DOM descendant of <form> —
 * see EditFieldDialog.tsx or ResourceUsageFormContainer.tsx for the
 * reference pattern.
 */

const REPORTED_COMPONENTS = new Set(['SubmitButton', 'CloseDialogButton']);

// Both already use ModalDialog's `footer` prop correctly for their real
// Cancel/Submit pair; the flagged button in each is a different,
// content-embedded action, not a mis-placed footer:
//  - ViewYAMLDialog.tsx: a `type="button"` Show/Hide-diff toggle next to a
//    Copy-to-clipboard button, styled via SubmitButton but never submitting
//    the form.
//  - GroupInvitationCreateDialog.tsx: "Generate link" sits directly above
//    the InvitationLinkField it populates -- moving it to the footer would
//    separate the action from its own result.
const ALLOWED_FILES = [
  'src/rancher/cluster/ViewYAMLDialog.tsx',
  'src/invitations/actions/GroupInvitationCreateDialog.tsx',
];

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        "Prefer ModalDialog's footer prop over hand-rolling action buttons inside its children",
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      noHandRolledModalFooter:
        "'{{component}}' renders inside ModalDialog's children, landing nested inside .modal-body instead of as a real .modal-footer sibling.\n" +
        "  Pass it via ModalDialog's own `footer` prop instead — wrap the <form> around the whole\n" +
        '  <ModalDialog>, not inside it, so a native submit button stays a DOM descendant of <form>.\n' +
        '  See EditFieldDialog.tsx or ResourceUsageFormContainer.tsx for the reference pattern.',
    },
  },

  create(context) {
    const filename = context.filename.replace(/\\/g, '/');
    if (ALLOWED_FILES.some((allowed) => filename.includes(allowed))) {
      return {};
    }

    return {
      JSXOpeningElement(node) {
        if (
          node.name.type !== 'JSXIdentifier' ||
          !REPORTED_COMPONENTS.has(node.name.name)
        ) {
          return;
        }

        const ancestors = context.sourceCode.getAncestors(node);
        for (let i = 0; i < ancestors.length; i++) {
          const ancestor = ancestors[i];
          if (
            ancestor.type !== 'JSXElement' ||
            ancestor.openingElement.name.type !== 'JSXIdentifier' ||
            ancestor.openingElement.name.name !== 'ModalDialog'
          ) {
            continue;
          }
          // The next node on the path down to our target: if it's the
          // ModalDialog's own openingElement, we descended through an
          // attribute (e.g. `footer={...}`) — the correct pattern, not a
          // violation. Otherwise we descended through `.children` — the
          // button is part of the body content.
          const next = ancestors[i + 1];
          if (next === ancestor.openingElement) {
            continue;
          }
          context.report({
            node,
            messageId: 'noHandRolledModalFooter',
            data: { component: node.name.name },
          });
          return;
        }
      },
    };
  },
};
