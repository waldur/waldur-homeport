import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

const BillingSyncDialog = lazyComponent(() =>
  import('./BillingSyncDialog').then((module) => ({
    default: module.BillingSyncDialog,
  })),
);

interface BillingSyncButtonProps {
  refetch: () => void;
}

export const BillingSyncButton = ({ refetch }: BillingSyncButtonProps) => {
  const dispatch = useDispatch();

  const handleClick = useCallback(() => {
    dispatch(
      openModalDialog(BillingSyncDialog, {
        resolve: { refetch },
        size: 'lg',
      }),
    );
  }, [dispatch, refetch]);

  return (
    <ActionButton
      action={handleClick}
      title={translate('Sync billing')}
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
      variant="primary"
    />
  );
};
