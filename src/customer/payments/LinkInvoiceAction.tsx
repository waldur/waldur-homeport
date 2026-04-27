import { FunctionComponent, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAsyncFn, useBoolean } from 'react-use';
import { Invoice, invoicesList, paymentsLinkToInvoice } from 'waldur-js-client';

import { getAllPages } from '@/core/api';
import { InvoicesDropdown } from '@/customer/payments/InvoicesDropdown';
import { translate } from '@/i18n';
import { showSuccess, showErrorResponse } from '@/store/notify';
import { getCustomer, getUser } from '@/workspace/selectors';
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
  const customer = useSelector(getCustomer);
  const dispatch = useDispatch();
  const user = useSelector(getUser);

  const [{ loading, error, value }, getInvoices] = useAsyncFn(
    () => loadInvoices(customer),
    [customer],
  );

  const [open, onToggle] = useBoolean(false);

  const loadInvoicesIfOpen = useCallback(() => {
    if (open) getInvoices();
  }, [open, getInvoices]);

  useEffect(loadInvoicesIfOpen, [open]);

  const triggerAction = async (selectedInvoice: Invoice) => {
    try {
      await paymentsLinkToInvoice({
        path: { uuid: payment.uuid },
        body: {
          invoice: selectedInvoice.url,
        },
      });
      dispatch(
        showSuccess(
          translate('Invoice has been successfully linked to payment.'),
        ),
      );
      dispatch(updatePaymentsList(customer));
    } catch (error) {
      dispatch(
        showErrorResponse(
          error,
          translate('Unable to link invoice to the payment.'),
        ),
      );
    }
  };

  return (
    <InvoicesDropdown
      open={open}
      disabled={!user.is_staff}
      loading={loading}
      error={error}
      invoices={value}
      onToggle={onToggle}
      onSelect={triggerAction}
      variant="outline"
    />
  );
};
