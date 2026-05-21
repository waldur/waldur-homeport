import { FunctionComponent, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useAsyncFn, useBoolean } from 'react-use';
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

  const [{ loading, error, value }, getInvoices] = useAsyncFn(
    () => loadInvoices(customer),
    [customer],
  );

  const [open, onToggle] = useBoolean(false);

  const loadInvoicesIfOpen = useCallback(() => {
    if (open) getInvoices();
  }, [open, getInvoices]);

  useEffect(loadInvoicesIfOpen, [open]);

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
