import * as React from 'react';
import { useSelector } from 'react-redux';
import { useBoolean } from 'react-use';
import useAsyncFn from 'react-use/lib/useAsyncFn';

import { getAll } from '@waldur/core/api';
import { InvoicesDropdown } from '@waldur/customer/payments/InvoicesDropdown';
import { Invoice } from '@waldur/invoices/types';
import { getCustomer } from '@waldur/workspace/selectors';
import { Customer } from '@waldur/workspace/types';

interface LinkInvoiceActionProps {
  onInvoiceSelect: (invoice) => any;
  disabled: boolean;
}

const loadInvoices = (customer: Customer) =>
  getAll<Invoice[]>('/invoices/', {
    params: { customer: customer.url, state: 'paid' },
  });

export const LinkInvoiceAction = (props: LinkInvoiceActionProps) => {
  const customer = useSelector(getCustomer);

  const [{ loading, error, value }, getInvoices] = useAsyncFn(
    () => loadInvoices(customer),
    [customer],
  );

  const [open, onToggle] = useBoolean(false);

  const loadInvoicesIfOpen = React.useCallback(() => {
    open && getInvoices();
  }, [open, getInvoices]);

  React.useEffect(loadInvoicesIfOpen, [open]);

  const triggerAction = (selectedInvoice: Invoice) => {
    if (props.disabled) {
      return;
    }
    props.onInvoiceSelect(selectedInvoice);
  };

  return (
    <InvoicesDropdown
      open={open}
      disabled={props.disabled}
      loading={loading}
      error={error}
      invoices={value}
      onToggle={onToggle}
      onSelect={triggerAction}
    />
  );
};
