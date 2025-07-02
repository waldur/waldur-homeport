import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Payment, PaymentsListData } from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { PAYMENTS_TABLE } from '@waldur/customer/details/constants';
import { PaymentInvoiceRenderer } from '@waldur/customer/payments/PaymentInvoiceRenderer';
import { PaymentProofRenderer } from '@waldur/customer/payments/PaymentProofRenderer';
import { translate } from '@waldur/i18n';
import { getActivePaymentProfile } from '@waldur/invoices/details/utils';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { Column } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';
import { getCustomer } from '@waldur/workspace/selectors';

import { CreatePaymentButton } from './CreatePaymentButton';
import { PaymentActions } from './PaymentActions';

export const PaymentsList: FunctionComponent = () => {
  const customer = useSelector(getCustomer);
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
    fetchData: createFetcher('payments'),
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
      tableActions={<CreatePaymentButton activePaymentProfile={profile} />}
      rowActions={({ row }) => (
        <PaymentActions refetch={props.fetch} row={row} />
      )}
    />
  );
};
