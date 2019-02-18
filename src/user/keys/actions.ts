import { openModalDialog } from '@waldur/modal/actions';

export const showKeyRemoveConfirmation = (action: () => void) =>
  openModalDialog('KeyRemoveDialog', {resolve: { action }, size: 'md'});
