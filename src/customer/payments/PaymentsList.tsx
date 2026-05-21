import { FunctionComponent, useMemo } from 'react';
import { Payment, paymentsList, PaymentsListData } from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { PAYMENTS_TABLE } from '@/customer/details/constants';
import { PaymentInvoiceRenderer } from '@/customer/payments/PaymentInvoiceRenderer';
import { PaymentProofRenderer } from '@/customer/payments/PaymentProofRenderer';
import { translate } from '@/i18n';
import { getActivePaymentProfile } from '@/invoices/details/utils';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { useCustomer } from '@/workspace/hooks';

import { CreatePaymentButton } from './CreatePaymentButton';
import { PaymentActions } from './PaymentActions';

export const PaymentsList: FunctionComponent = () => {
  const customer = useCustomer();
  const profile = useMemo(
    () => getActivePaymentProfile(customer.payment_profiles),
    [customer],
  );

  const filter = useMemo(
    (): PaymentsListData['query'] => ({
      profile_uuid: profile?.uuid,
    }),
    [profile],
  );

  const props = useTable({
    table: PAYMENTS_TABLE,
    fetchData: createFetcher(paymentsList),
    filter,
  });

  if (!profile) {
    return (
      <p>
        {translate(
          'Please, create and enable a payment profile to be able to manage payments.',
        )}
      </p>
    );
  }

  const columns: Column<Payment>[] = [
    {
      title: translate('Date'),
      render: ({ row }) => formatDateTime(row.date_of_payment),
    },
    {
      title: translate('Sum'),
      render: ({ row }) => row.sum,
    },
    {
      title: translate('Proof'),
      render: PaymentProofRenderer,
    },
    {
      title: translate('Invoice'),
      render: PaymentInvoiceRenderer,
    },
  ];

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('payments')}
      showPageSizeSelector={true}
      tableActions={
        <CreatePaymentButton
          activePaymentProfile={profile}
          refetch={props.fetch}
        />
      }
      rowActions={({ row }) => (
        <PaymentActions refetch={props.fetch} row={row} />
      )}
    />
  );
};
