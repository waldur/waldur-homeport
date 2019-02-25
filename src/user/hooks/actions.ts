import { openModalDialog } from '@waldur/modal/actions';

export const showHookRemoveConfirmation = (action: () => void) =>
  openModalDialog('hookRemoveDialog', {resolve: { action }, size: 'md'});

export const showHookUpdateDialog = (row?) =>
  openModalDialog('hookDetails', {resolve: { hook: row }, size: 'md'});
