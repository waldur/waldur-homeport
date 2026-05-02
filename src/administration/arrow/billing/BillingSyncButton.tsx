import { ArrowsClockwiseIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
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
  const { openDialog } = useModal();

  return (
    <ActionButton
      action={() => {
        openDialog(BillingSyncDialog, {
          resolve: { refetch },
          size: 'lg',
        });
      }}
      title={translate('Sync billing')}
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
      variant="primary"
    />
  );
};
