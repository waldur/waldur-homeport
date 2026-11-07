import { useCallback } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { useModal } from '@/modal/actions';

import type { OfferingChangeDialogResolve } from './OfferingChangeDialog';

const OfferingChangeDialog = lazyComponent(() =>
  import('./OfferingChangeDialog').then((module) => ({
    default: module.OfferingChangeDialog,
  })),
);

/** Opens the confirm of a change guarded by what depends on the offering. */
export const useOpenOfferingChange = () => {
  const { openDialog } = useModal();
  return useCallback(
    (resolve: OfferingChangeDialogResolve) =>
      openDialog(OfferingChangeDialog, { resolve }),
    [openDialog],
  );
};
