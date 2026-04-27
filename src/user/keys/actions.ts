import { lazyComponent } from '@/core/lazyComponent';
import { openModalDialog } from '@/modal/actions';

const KeyCreateDialog = lazyComponent(() =>
  import('./KeyCreateDialog').then((module) => ({
    default: module.KeyCreateDialog,
  })),
);

export const keyCreateDialog = () =>
  openModalDialog(KeyCreateDialog, { size: 'lg' });
