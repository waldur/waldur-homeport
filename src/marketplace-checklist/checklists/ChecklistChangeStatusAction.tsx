import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const ChecklistStatusDialog = lazyComponent(() =>
  import('./ChecklistStatusDialog').then((module) => ({
    default: module.ChecklistStatusDialog,
  })),
);

export const ChecklistChangeStatusAction = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const callback = useCallback(() => {
    dispatch(
      openModalDialog(ChecklistStatusDialog, {
        resolve: { refetch, checklistUuid: row.uuid },
        initialValues: { status: 'test' }, // FIX: not available atm
        size: 'sm',
      }),
    );
  }, [dispatch, refetch, row]);

  return (
    <ActionItem
      title={translate('Change status')}
      action={callback}
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
    />
  );
};
