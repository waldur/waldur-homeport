import { lazyComponent } from '@/core/lazyComponent';
import { openModalDialog } from '@/modal/actions';

const HookDetailsDialog = lazyComponent(() =>
  import('./HookDetailsDialog').then((module) => ({
    default: module.HookDetailsDialog,
  })),
);

export const showHookUpdateDialog = (resolve) =>
  openModalDialog(HookDetailsDialog, {
    resolve,
    size: 'lg',
  });
