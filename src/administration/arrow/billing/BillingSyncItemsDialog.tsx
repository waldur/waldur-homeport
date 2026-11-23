import type { ArrowBillingSync, ArrowBillingSyncItem } from 'waldur-js-client';

import { defaultCurrency } from '@/core/formatCurrency';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { SimpleTable } from '@/table/SimpleTable';

import { useArrowBillingSyncItems } from '../api';

interface BillingSyncItemsDialogProps {
  resolve: {
    billingSync: ArrowBillingSync;
  };
}

const BillingSyncItemsTable = ({
  items,
}: {
  items: ArrowBillingSyncItem[];
}) => (
  <div className="max-h-[500px] overflow-y-auto">
    <SimpleTable<ArrowBillingSyncItem>
      columns={[
        {
          title: translate('Line Reference'),
          render: ({ row }) => <>{row.arrow_line_reference}</>,
        },
        {
          title: translate('Subscription'),
          render: ({ row }) => <>{row.subscription_reference}</>,
        },
        {
          title: translate('Vendor'),
          render: ({ row }) => <>{row.vendor_name}</>,
        },
        {
          title: translate('Description'),
          render: ({ row }) => <>{row.description}</>,
        },
        {
          title: translate('Quantity'),
          className: 'text-end',
          headerClassName: 'text-end',
          render: ({ row }) => <>{row.quantity}</>,
        },
        {
          title: translate('Original Price'),
          className: 'text-end',
          headerClassName: 'text-end',
          render: ({ row }) => <>{defaultCurrency(row.original_price)}</>,
        },
      ]}
      rows={items}
    />
  </div>
);

export const BillingSyncItemsDialog = ({
  resolve,
}: BillingSyncItemsDialogProps) => {
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
        <CloseDialogButton variant="secondary" label={translate('Close')} />
      }
    >
      {isLoading ? (
        <div className="text-center py-5">
          <LoadingSpinner />
        </div>
      ) : displayItems.length === 0 ? (
        <div className="text-center text-quaternary py-5">
          {translate('No items found')}
        </div>
      ) : (
        <BillingSyncItemsTable items={displayItems} />
      )}
    </ModalDialog>
  );
};
