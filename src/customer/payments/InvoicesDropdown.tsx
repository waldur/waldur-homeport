import { FileTextIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { Invoice } from 'waldur-js-client';

import { ButtonVariant, Menu } from 'waldur-ui';

import { translate } from '@/i18n';

interface ResourceActionComponentProps {
  onToggle: (isOpen: boolean) => void;
  onSelect: (invoice: Invoice) => void;
  disabled?: boolean;
  open?: boolean;
  loading?: boolean;
  error?: object;
  variant?: ButtonVariant;
  invoices: Invoice[];
}

const ActionItem = ({ invoice, onSelect }) => (
  <Menu.Item onSelect={() => onSelect(invoice)}>
    {invoice.month} - {invoice.year} ({invoice.state})
  </Menu.Item>
);

export const InvoicesDropdown: FunctionComponent<
  ResourceActionComponentProps
> = (props) => (
  <Menu open={props.open} onOpenChange={props.onToggle}>
    <Menu.TriggerButton
      id="link-invoice-dropdown-btn"
      className="dropdown-btn"
      disabled={props.disabled}
      variant={props.variant}
      size="lg"
      icon={<FileTextIcon weight="bold" />}
    >
      {translate('Link invoice')}
    </Menu.TriggerButton>
    <Menu.Content look="actions" side="bottom">
      {props.open ? (
        props.loading ? (
          <Menu.Item disabled>{translate('Loading invoices')}</Menu.Item>
        ) : props.error ? (
          <Menu.Item disabled>{translate('Unable to load invoices')}</Menu.Item>
        ) : props.invoices ? (
          Object.keys(props.invoices).length === 0 ? (
            <Menu.Item disabled>
              {translate('There are no invoices.')}
            </Menu.Item>
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
    </Menu.Content>
  </Menu>
);
