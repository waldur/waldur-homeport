import { EyeIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import type { ArrowBillingSync } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';
import { ActionsDropdown } from '@waldur/table/ActionsDropdown';

const BillingSyncItemsDialog = lazyComponent(() =>
  import('./BillingSyncItemsDialog').then((module) => ({
    default: module.BillingSyncItemsDialog,
  })),
);

interface BillingSyncActionsProps {
  row: ArrowBillingSync;
}

export const BillingSyncActions = ({ row }: BillingSyncActionsProps) => {
  const dispatch = useDispatch();

  const handleViewItems = useCallback(() => {
    dispatch(
      openModalDialog(BillingSyncItemsDialog, {
        resolve: { billingSync: row },
        size: 'xl',
      }),
    );
  }, [dispatch, row]);

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
