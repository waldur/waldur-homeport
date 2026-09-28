import { ArrowsClockwiseIcon } from '@phosphor-icons/react';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

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
    <BaseButton
      onClick={() => {
        openDialog(BillingSyncDialog, {
          resolve: { refetch },
          size: 'lg',
        });
      }}
      label={translate('Sync billing')}
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
      variant="primary"
      size="lg"
    />
  );
};
