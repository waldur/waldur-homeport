import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';

const KeyCreateDialog = lazyComponent(() =>
  import('./KeyCreateDialog').then((module) => ({
    default: module.KeyCreateDialog,
  })),
);

export const keyCreateDialog = () =>
  openModalDialog(KeyCreateDialog, { size: 'lg' });
