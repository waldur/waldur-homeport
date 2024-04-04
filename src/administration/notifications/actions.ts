import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';

import { ADMIN_HOOK_LIST_ID } from './constants';

const HookDetailsDialog = lazyComponent(
  () => import('@waldur/user/hooks/HookDetailsDialog'),
  'HookDetailsDialog',
);

export const showHookUpdateDialog = (row?) =>
  openModalDialog(HookDetailsDialog, {
    resolve: { hook: row, listId: ADMIN_HOOK_LIST_ID },
    size: 'md',
  });
