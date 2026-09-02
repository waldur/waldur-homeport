import { FileTextIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { Invoice } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ActionDropdownButton } from '@/table/ActionDropdownButton';
import { ActionsDropdownItem } from '@/table/ActionsDropdown';

interface ResourceActionComponentProps {
  onToggle: (isOpen: boolean) => void;
  onSelect: (invoice: Invoice) => void;
  disabled?: boolean;
  open?: boolean;
  loading?: boolean;
  error?: object;
  variant?: string;
  invoices: Invoice[];
}

const ActionItem = ({ invoice, onSelect }) => (
  <ActionsDropdownItem onSelect={() => onSelect(invoice)}>
    {invoice.month} - {invoice.year} ({invoice.state})
  </ActionsDropdownItem>
);

export const InvoicesDropdown: FunctionComponent<
  ResourceActionComponentProps
> = (props) => (
  <ActionDropdownButton
    title={
      <>
        <span className="svg-icon svg-icon-2">
          <FileTextIcon weight="bold" />
        </span>{' '}
        {translate('Link invoice')}
      </>
    }
    id="link-invoice-dropdown-btn"
    className="dropdown-btn"
    onToggle={props.onToggle}
    disabled={props.disabled}
    variant={props.variant}
  >
    {props.open ? (
      props.loading ? (
        <ActionsDropdownItem disabled>
          {translate('Loading invoices')}
        </ActionsDropdownItem>
      ) : props.error ? (
        <ActionsDropdownItem disabled>
          {translate('Unable to load invoices')}
        </ActionsDropdownItem>
      ) : props.invoices ? (
        Object.keys(props.invoices).length === 0 ? (
          <ActionsDropdownItem disabled>
            {translate('There are no invoices.')}
          </ActionsDropdownItem>
        ) : (
          Object.keys(props.invoices).map((invoice) => (
            <ActionItem
              key={invoice}
              invoice={props.invoices[invoice]}
              onSelect={props.onSelect}
            />
          ))
        )
      ) : null
    ) : null}
  </ActionDropdownButton>
);
