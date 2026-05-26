import { PencilSimpleIcon } from '@phosphor-icons/react';
import { FC, useCallback } from 'react';
import { CallReviewerPool } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionsDropdownComponent } from '@/table/ActionsDropdown';

const EditCapacityDialog = lazyComponent(() =>
  import('./EditCapacityDialog').then((m) => ({
    default: m.EditCapacityDialog,
  })),
);

interface ReviewerCapacityRowActionsProps {
  row: CallReviewerPool;
  refetch: () => void;
}

export const ReviewerCapacityRowActions: FC<
  ReviewerCapacityRowActionsProps
> = ({ row, refetch }) => {
  const { openDialog } = useModal();

  const handleEdit = useCallback(() => {
    openDialog(EditCapacityDialog, {
      resolve: { poolMember: row, refetch },
    });
  }, [row, refetch, openDialog]);

  return (
    <ActionsDropdownComponent>
      <ActionItem
        title={translate('Edit capacity')}
        action={handleEdit}
        iconNode={<PencilSimpleIcon weight="bold" />}
      />
    </ActionsDropdownComponent>
  );
};
