import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const ChecklistStatusDialog = lazyComponent(() =>
  import('./ChecklistStatusDialog').then((module) => ({
    default: module.ChecklistStatusDialog,
  })),
);

export const ChecklistChangeStatusAction = ({ row, refetch }) => {
  const { openDialog } = useModal();
  const callback = useCallback(() => {
    openDialog(ChecklistStatusDialog, {
      resolve: { refetch, checklistUuid: row.uuid },
      initialValues: { status: 'test' }, // FIX: not available atm
      size: 'sm',
    });
  }, [refetch, row]);

  return (
    <ActionItem
      title={translate('Change status')}
      action={callback}
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
    />
  );
};
