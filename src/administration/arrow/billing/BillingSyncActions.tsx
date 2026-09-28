import { EyeIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';
import type { ArrowBillingSync } from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionsDropdown } from '@/table/ActionsDropdown';

const BillingSyncItemsDialog = lazyComponent(() =>
  import('./BillingSyncItemsDialog').then((module) => ({
    default: module.BillingSyncItemsDialog,
  })),
);

interface BillingSyncActionsProps {
  row: ArrowBillingSync;
}

export const BillingSyncActions = ({ row }: BillingSyncActionsProps) => {
  const { openDialog } = useModal();

  const handleViewItems = useCallback(() => {
    openDialog(BillingSyncItemsDialog, {
      resolve: { billingSync: row },
      size: 'xl',
    });
  }, [row]);

  return (
    <ActionsDropdown>
      <BaseButton
        onClick={handleViewItems}
        label={translate('View items')}
        iconNode={<EyeIcon weight="bold" />}
        variant="secondary"
        size="lg"
      />
    </ActionsDropdown>
  );
};
