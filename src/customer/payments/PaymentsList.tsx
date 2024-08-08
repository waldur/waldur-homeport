import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { formatDateTime } from '@waldur/core/dateUtils';
import { PAYMENTS_TABLE } from '@waldur/customer/details/constants';
import { PaymentInvoiceRenderer } from '@waldur/customer/payments/PaymentInvoiceRenderer';
import { PaymentProofRenderer } from '@waldur/customer/payments/PaymentProofRenderer';
import { translate } from '@waldur/i18n';
import { getActivePaymentProfile } from '@waldur/invoices/details/utils';
import { createFetcher, Table } from '@waldur/table';
import { useTable } from '@waldur/table/utils';
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
    () => ({
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

  const columns = [
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
    {
      title: translate('Actions'),
      render: ({ row }) => <PaymentActions payment={row} />,
    },
  ];

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('payments')}
      showPageSizeSelector={true}
      tableActions={<CreatePaymentButton activePaymentProfile={profile} />}
    />
  );
};
