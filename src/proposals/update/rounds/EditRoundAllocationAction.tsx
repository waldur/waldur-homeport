import { ListChecksIcon } from '@phosphor-icons/react';
import { FC, useCallback } from 'react';
import { ProtectedRound } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { Call } from '@/proposals/types';
import { ActionItem } from '@/resource/actions/ActionItem';

const EditRoundAllocationDialog = lazyComponent(() =>
  import('@/proposals/round/allocation/EditRoundAllocationDialog').then(
    (m) => ({
      default: m.EditRoundAllocationDialog,
    }),
  ),
);

interface EditRoundAllocationActionProps {
  row: ProtectedRound;
  refetch: () => void;
  call: Call;
}

export const EditRoundAllocationAction: FC<EditRoundAllocationActionProps> = ({
  row,
  refetch,
  call,
}) => {
  const { openDialog } = useModal();

  const openEditAllocationDialog = useCallback(() => {
    openDialog(EditRoundAllocationDialog, {
      resolve: { round: row, call, refetch },
      size: 'lg',
    });
  }, [row, call, refetch, openDialog]);

  return (
    <ActionItem
      title={translate('Edit allocation settings')}
      action={openEditAllocationDialog}
      iconNode={<ListChecksIcon weight="bold" />}
    />
  );
};
