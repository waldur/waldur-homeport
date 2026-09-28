/**
 * The Waldur button wrappers, listed in the messages of both
 * `no-bootstrap-button-markup` (the hand-rolled `btn` classes) and the
 * `no-restricted-imports` entry for `Button` (eslint.config.js) so the two
 * stay in step.
 */
export const WRAPPERS =
  '  - BaseButton: the general-purpose wrapper from waldur-ui (page actions, dialogs, icon buttons)\n' +
  '  - SubmitButton: for form submit and action buttons\n' +
  '  - CloseDialogButton: for modal cancel/close buttons';
