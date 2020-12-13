import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';

const KeyRemoveDialog = lazyComponent(
  () => import(/* webpackChunkName: "KeyRemoveDialog" */ './KeyRemoveDialog'),
  'KeyRemoveDialog',
);

export const showKeyRemoveConfirmation = (action: () => void) =>
  openModalDialog(KeyRemoveDialog, { resolve: { action }, size: 'md' });
