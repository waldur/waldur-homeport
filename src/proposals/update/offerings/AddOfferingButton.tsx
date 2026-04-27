import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { AddButton } from '@/core/AddButton';
import { lazyComponent } from '@/core/lazyComponent';
import { openModalDialog } from '@/modal/actions';
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
  const dispatch = useDispatch();
  const openOfferingCreateDialog = useCallback(
    () =>
      dispatch(
        openModalDialog(CallOfferingCreateDialog, {
          resolve: { call, refetch },
          size: 'lg',
        }),
      ),
    [dispatch],
  );

  return <AddButton action={openOfferingCreateDialog} />;
};
