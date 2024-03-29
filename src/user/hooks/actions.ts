import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';

import { HOOK_LIST_ID } from './constants';

const HookDetailsDialog = lazyComponent(
  () => import('./HookDetailsDialog'),
  'HookDetailsDialog',
);
const HookRemoveDialog = lazyComponent(
  () => import('./HookRemoveDialog'),
  'HookRemoveDialog',
);

export const showHookRemoveConfirmation = (action: () => void) =>
  openModalDialog(HookRemoveDialog, {
    resolve: { action, listId: HOOK_LIST_ID },
    size: 'md',
  });

export const showHookUpdateDialog = (row?) =>
  openModalDialog(HookDetailsDialog, {
    resolve: { hook: row, listId: HOOK_LIST_ID },
    size: 'md',
  });
