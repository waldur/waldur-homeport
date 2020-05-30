import { openModalDialog } from '@waldur/modal/actions';

import { KeyRemoveDialog } from './KeyRemoveDialog';

export const showKeyRemoveConfirmation = (action: () => void) =>
  openModalDialog(KeyRemoveDialog, { resolve: { action }, size: 'md' });
