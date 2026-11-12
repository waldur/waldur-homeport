/**
 * The app's modal shell is waldur-ui's (packages/ui/src/Dialog/Modal.tsx):
 * a Radix Dialog in the app's modal geometry. Kept as a
 * module of its own so ModalRoot, ConfirmModalRoot and the dialogs that
 * render a shell themselves keep importing it from here.
 */
export { ModalShell } from 'waldur-ui';
