import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';

const KeyRemoveDialog = lazyComponent(
  () => import(/* webpackChunkName: "KeyRemoveDialog" */ './KeyRemoveDialog'),
  'KeyRemoveDialog',
);
const KeyCreateDialog = lazyComponent(
  () => import(/* webpackChunkName: "KeyCreateDialog" */ './KeyCreateDialog'),
  'KeyCreateDialog',
);

export const showKeyRemoveConfirmation = (action: () => void) =>
  openModalDialog(KeyRemoveDialog, { resolve: { action }, size: 'md' });

export const keyCreateDialog = () =>
  openModalDialog(KeyCreateDialog, { size: 'md' });
