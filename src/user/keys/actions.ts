import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';

const KeyRemoveDialog = lazyComponent(
  () => import('./KeyRemoveDialog'),
  'KeyRemoveDialog',
);
const KeyCreateDialog = lazyComponent(
  () => import('./KeyCreateDialog'),
  'KeyCreateDialog',
);

export const showKeyRemoveConfirmation = (action: () => void) =>
  openModalDialog(KeyRemoveDialog, { resolve: { action }, size: 'md' });

export const keyCreateDialog = () =>
  openModalDialog(KeyCreateDialog, { size: 'md' });
