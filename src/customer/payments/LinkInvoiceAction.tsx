import { FunctionComponent, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAsyncFn, useBoolean } from 'react-use';

import { getAll } from '@waldur/core/api';
import { InvoicesDropdown } from '@waldur/customer/payments/InvoicesDropdown';
import { Invoice } from '@waldur/invoices/types';
import { getCustomer, getUser } from '@waldur/workspace/selectors';
import { Customer } from '@waldur/workspace/types';

import { linkInvoice } from './store/actions';

const loadInvoices = (customer: Customer) =>
  getAll<Invoice[]>('/invoices/', {
    params: { customer: customer.url, state: 'paid' },
  });

export const LinkInvoiceAction: FunctionComponent<{ payment }> = ({
  payment,
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
    open && getInvoices();
  }, [open, getInvoices]);

  useEffect(loadInvoicesIfOpen, [open]);

  const triggerAction = (selectedInvoice: Invoice) => {
    dispatch(linkInvoice(payment.uuid, selectedInvoice.url));
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
    />
  );
};
