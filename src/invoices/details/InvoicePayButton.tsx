import { MoneyIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { translate } from '@/i18n';
import { ActionsDropdownItem } from '@/table/ActionsDropdown';
import { useCustomer } from '@/workspace/hooks';

import { Invoice } from '../types';

import { hasMonthlyPaymentProfile } from './utils';

interface InvoicePayButtonProps {
  row: Invoice;
  asButton?: boolean;
}

export const InvoicePayButton: FC<InvoicePayButtonProps> = ({
  row,
  asButton,
}) => {
  const customer = useCustomer();
  const showPayment = customer && hasMonthlyPaymentProfile(customer);
  if (!row?.payment_url || !showPayment || row.state !== 'created') {
    return null;
  }

  return asButton ? (
    <a
      className="btn btn-warning px-2"
      href={row.payment_url}
      target="_self"
      rel="noopener noreferrer"
    >
      <span className="svg-icon svg-icon-2">
        <MoneyIcon weight="bold" />
      </span>
      {translate('Pay')}
    </a>
  ) : (
    // asChild: the row *is* the link, same reasoning as every other
    // link-shaped ActionsDropdownItem in this migration (see
    // OpenPublicOffering.tsx / MatrixChatHeader.tsx).
    <ActionsDropdownItem asChild>
      <a href={row.payment_url} target="_self" rel="noopener noreferrer">
        <span className="svg-icon svg-icon-2">
          <MoneyIcon weight="bold" />
        </span>
        {translate('Pay')}
      </a>
    </ActionsDropdownItem>
  );
};
