import * as React from 'react';
import * as DropdownButton from 'react-bootstrap/lib/DropdownButton';
import * as MenuItem from 'react-bootstrap/lib/MenuItem';

import { translate } from '@waldur/i18n';
import { Invoice } from '@waldur/invoices/types';

interface ResourceActionComponentProps {
  onToggle: (isOpen: boolean) => void;
  onSelect: (invoice: Invoice) => void;
  disabled?: boolean;
  open?: boolean;
  loading?: boolean;
  error?: object;
  invoices: object;
}

const ActionItem = ({ invoice, invoiceKey, onSelect }) => (
  <MenuItem eventKey={invoiceKey} onSelect={() => onSelect(invoice)}>
    {invoice.month} - {invoice.year} ({invoice.state})
  </MenuItem>
);

export const InvoicesDropdown = (props: ResourceActionComponentProps) => (
  <DropdownButton
    title={
      <>
        <i className="fa fa-file-text-o"></i> {translate('Link invoice')}
      </>
    }
    id="link-invoice-dropdown-btn"
    className="dropdown-btn"
    onToggle={props.onToggle}
    open={props.open}
    disabled={props.disabled}
  >
    {props.open ? (
      props.loading ? (
        <MenuItem eventKey="1">{translate('Loading invoices')}</MenuItem>
      ) : props.error ? (
        <MenuItem eventKey="1">{translate('Unable to load invoices')}</MenuItem>
      ) : props.invoices ? (
        Object.keys(props.invoices).length === 0 ? (
          <MenuItem eventKey="2">
            {translate('There are no invoices.')}
          </MenuItem>
        ) : (
          Object.keys(props.invoices).map((invoice) => (
            <ActionItem
              key={invoice}
              invoice={props.invoices[invoice]}
              invoiceKey={invoice}
              onSelect={props.onSelect}
            />
          ))
        )
      ) : null
    ) : null}
  </DropdownButton>
);
