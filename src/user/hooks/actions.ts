import { openModalDialog } from '@waldur/modal/actions';

import { HookDetailsDialog } from './HookDetailsDialog';
import { HookRemoveDialog } from './HookRemoveDialog';

export const showHookRemoveConfirmation = (action: () => void) =>
  openModalDialog(HookRemoveDialog, { resolve: { action }, size: 'md' });

export const showHookUpdateDialog = (row?) =>
  openModalDialog(HookDetailsDialog, { resolve: { hook: row }, size: 'md' });
