import { useCallback } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { useModal } from '@/modal/actions';
import { useUser } from '@/workspace/hooks';

import { hasSupport } from '../hooks';

import type { StaffRequestRecipient } from './StaffRequestDialog';

const StaffRequestDialog = lazyComponent(() =>
  import('./StaffRequestDialog').then((module) => ({
    default: module.StaffRequestDialog,
  })),
);

/**
 * Entry point for a support request that staff open for another user.
 * `canOpen` is false for non-staff, when support is disabled, and for the
 * staff member's own account — that one goes through the regular create form.
 */
export const useStaffRequest = (recipient?: StaffRequestRecipient) => {
  const currentUser = useUser();
  const { openDialog } = useModal();

  const canOpen =
    hasSupport() &&
    Boolean(currentUser?.is_staff) &&
    Boolean(recipient?.uuid) &&
    recipient.uuid !== currentUser.uuid;

  const open = useCallback(
    () =>
      openDialog(StaffRequestDialog, {
        resolve: { recipient },
        dialogClassName: 'modal-dialog-centered mw-650px',
      }),
    [openDialog, recipient],
  );

  return { canOpen, open };
};
