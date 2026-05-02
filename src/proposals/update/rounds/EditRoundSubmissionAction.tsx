import { CalendarIcon } from '@phosphor-icons/react';
import { FC, useCallback } from 'react';
import { ProtectedRound } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { Call } from '@/proposals/types';
import { ActionItem } from '@/resource/actions/ActionItem';

const EditRoundSubmissionDialog = lazyComponent(() =>
  import('@/proposals/round/submission/EditRoundSubmissionDialog').then(
    (m) => ({
      default: m.EditRoundSubmissionDialog,
    }),
  ),
);

interface EditRoundSubmissionActionProps {
  row: ProtectedRound;
  refetch: () => void;
  call: Call;
}

export const EditRoundSubmissionAction: FC<EditRoundSubmissionActionProps> = ({
  row,
  refetch,
  call,
}) => {
  const { openDialog } = useModal();

  const openEditSubmissionDialog = useCallback(() => {
    openDialog(EditRoundSubmissionDialog, {
      resolve: { round: row, call, refetch },
      size: 'lg',
    });
  }, [row, call, refetch, openDialog]);

  return (
    <ActionItem
      title={translate('Edit submission settings')}
      action={openEditSubmissionDialog}
      iconNode={<CalendarIcon weight="bold" />}
    />
  );
};
