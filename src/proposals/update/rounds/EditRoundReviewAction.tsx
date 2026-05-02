import { CheckSquareIcon } from '@phosphor-icons/react';
import { FC, useCallback } from 'react';
import { ProtectedRound } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { Call } from '@/proposals/types';
import { ActionItem } from '@/resource/actions/ActionItem';

const EditRoundReviewDialog = lazyComponent(() =>
  import('@/proposals/round/review/EditRoundReviewDialog').then((m) => ({
    default: m.EditRoundReviewDialog,
  })),
);

interface EditRoundReviewActionProps {
  row: ProtectedRound;
  refetch: () => void;
  call: Call;
}

export const EditRoundReviewAction: FC<EditRoundReviewActionProps> = ({
  row,
  refetch,
  call,
}) => {
  const { openDialog } = useModal();

  const openEditReviewDialog = useCallback(() => {
    openDialog(EditRoundReviewDialog, {
      resolve: { round: row, call, refetch },
      size: 'lg',
    });
  }, [row, call, refetch, openDialog]);

  return (
    <ActionItem
      title={translate('Edit review settings')}
      action={openEditReviewDialog}
      iconNode={<CheckSquareIcon weight="bold" />}
    />
  );
};
