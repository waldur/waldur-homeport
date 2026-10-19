// The modal provider lives in waldur-ui (packages/ui/src/Dialog), so a
// micro-app's shell mounts the same one; kept here so the app's imports
// don't change.
export { ModalContext, ModalProvider } from 'waldur-ui';
