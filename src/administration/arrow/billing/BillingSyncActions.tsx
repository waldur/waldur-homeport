import { EyeIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';
import type { ArrowBillingSync } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';
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
      <ActionButton
        action={handleViewItems}
        title={translate('View items')}
        iconNode={<EyeIcon weight="bold" />}
        variant="secondary"
      />
    </ActionsDropdown>
  );
};
