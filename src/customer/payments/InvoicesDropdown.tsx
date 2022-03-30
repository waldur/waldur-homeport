import { FunctionComponent } from 'react';
import { DropdownButton, Dropdown } from 'react-bootstrap';

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
  <Dropdown.Item eventKey={invoiceKey} onSelect={() => onSelect(invoice)}>
    {invoice.month} - {invoice.year} ({invoice.state})
  </Dropdown.Item>
);

export const InvoicesDropdown: FunctionComponent<ResourceActionComponentProps> =
  (props) => (
    <DropdownButton
      title={
        <>
          <i className="fa fa-file-text-o"></i> {translate('Link invoice')}
        </>
      }
      id="link-invoice-dropdown-btn"
      className="dropdown-btn"
      onToggle={props.onToggle}
      disabled={props.disabled}
    >
      {props.open ? (
        props.loading ? (
          <Dropdown.Item eventKey="1">
            {translate('Loading invoices')}
          </Dropdown.Item>
        ) : props.error ? (
          <Dropdown.Item eventKey="1">
            {translate('Unable to load invoices')}
          </Dropdown.Item>
        ) : props.invoices ? (
          Object.keys(props.invoices).length === 0 ? (
            <Dropdown.Item eventKey="2">
              {translate('There are no invoices.')}
            </Dropdown.Item>
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
