import { Table } from 'react-bootstrap';
import type { ArrowBillingSync, ArrowBillingSyncItem } from 'waldur-js-client';

import { defaultCurrency } from '@/core/formatCurrency';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ModalDialog } from '@/modal/ModalDialog';
import { ActionButton } from '@/table/ActionButton';

import { useArrowBillingSyncItems } from '../api';

interface BillingSyncItemsDialogProps {
  resolve: {
    billingSync: ArrowBillingSync;
  };
}

export const BillingSyncItemsDialog = ({
  resolve,
}: BillingSyncItemsDialogProps) => {
  const { closeDialog } = useModal();
  const { billingSync } = resolve;
  const { data: items, isLoading } = useArrowBillingSyncItems(billingSync.uuid);

  // Use embedded items if available, otherwise use fetched items
  const displayItems = billingSync.items || items || [];

  return (
    <ModalDialog
      title={translate('Billing Sync Items - {reference}', {
        reference: billingSync.arrow_reference,
      })}
      footer={
        <ActionButton
          action={closeDialog}
          variant="secondary"
          title={translate('Close')}
        />
      }
    >
      {isLoading ? (
        <div className="text-center py-6">
          <LoadingSpinner />
        </div>
      ) : displayItems.length === 0 ? (
        <div className="text-center text-muted py-6">
          {translate('No items found')}
        </div>
      ) : (
        <div className="table-responsive" style={{ maxHeight: '500px' }}>
          <Table striped bordered hover size="sm">
            <thead className="sticky-top bg-white">
              <tr>
                <th>{translate('Line Reference')}</th>
                <th>{translate('Subscription')}</th>
                <th>{translate('Vendor')}</th>
                <th>{translate('Description')}</th>
                <th className="text-end">{translate('Quantity')}</th>
                <th className="text-end">{translate('Original Price')}</th>
              </tr>
            </thead>
            <tbody>
              {displayItems.map((item: ArrowBillingSyncItem, index: number) => (
                <tr key={item.arrow_line_reference || index}>
                  <td>
                    <span className="small">{item.arrow_line_reference}</span>
                  </td>
                  <td>
                    <span className="small">{item.subscription_reference}</span>
                  </td>
                  <td>{item.vendor_name}</td>
                  <td>{item.description}</td>
                  <td className="text-end">{item.quantity}</td>
                  <td className="text-end">
                    {defaultCurrency(item.original_price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </ModalDialog>
  );
};
