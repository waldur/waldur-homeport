import { useCallback } from 'react';

import { AddButton } from '@/core/AddButton';
import { lazyComponent } from '@/core/lazyComponent';
import { useModal } from '@/modal/actions';
import { Call } from '@/proposals/types';

const CallOfferingCreateDialog = lazyComponent(() =>
  import('./CallOfferingCreateDialog').then((module) => ({
    default: module.CallOfferingCreateDialog,
  })),
);

interface AddOfferingButtonProps {
  call: Call;
  refetch(): void;
}

export const AddOfferingButton = ({
  call,
  refetch,
}: AddOfferingButtonProps) => {
  const { openDialog } = useModal();
  const openOfferingCreateDialog = useCallback(
    () =>
      openDialog(CallOfferingCreateDialog, {
        resolve: { call, refetch },
        size: 'lg',
      }),
    [],
  );

  return <AddButton action={openOfferingCreateDialog} />;
};
