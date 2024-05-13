import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';

const KeyCreateDialog = lazyComponent(
  () => import('./KeyCreateDialog'),
  'KeyCreateDialog',
);

export const keyCreateDialog = () =>
  openModalDialog(KeyCreateDialog, { size: 'md' });
