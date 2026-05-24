import { useQuery } from '@tanstack/react-query';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { useBoolean } from 'react-use';
import { Invoice, invoicesList, paymentsLinkToInvoice } from 'waldur-js-client';

import { getAllPages } from '@/core/api';
import { InvoicesDropdown } from '@/customer/payments/InvoicesDropdown';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useUser, useCustomer } from '@/workspace/hooks';
import { Customer } from '@/workspace/types';

import { updatePaymentsList } from './utils';

const loadInvoices = (customer: Customer) =>
  getAllPages((page) =>
    invoicesList({
      query: { customer: customer.url, state: ['paid'], page },
    }),
  );

export const LinkInvoiceAction: FunctionComponent<{ row }> = ({
  row: payment,
}) => {
  const customer = useCustomer();
  const dispatch = useDispatch();

  const user = useUser();

  const [open, onToggle] = useBoolean(false);

  const {
    isLoading: loading,
    error,
    data: value,
  } = useQuery({
    queryKey: ['invoices', customer.uuid],
    queryFn: () => loadInvoices(customer),
    enabled: open,
  });

  const { mutate, isPending } = useManagedMutation<any, any, Invoice>({
    mutationFn: (selectedInvoice) =>
      paymentsLinkToInvoice({
        path: { uuid: payment.uuid },
        body: {
          invoice: selectedInvoice.url,
        },
      }),
    successMessage: translate(
      'Invoice has been successfully linked to payment.',
    ),
    errorMessage: translate('Unable to link invoice to the payment.'),
    onSuccess: () => {
      dispatch(updatePaymentsList(customer));
    },
  });

  return (
    <InvoicesDropdown
      open={open}
      disabled={!user.is_staff || isPending}
      loading={loading}
      error={error}
      invoices={value}
      onToggle={onToggle}
      onSelect={mutate}
      variant="outline"
    />
  );
};
