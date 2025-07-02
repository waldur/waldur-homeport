import { MoneyIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { DropdownItem } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';

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
  const showPayment = useSelector(hasMonthlyPaymentProfile);
  if (!row?.payment_url || !showPayment || row.state !== 'created') {
    return null;
  }

  return asButton ? (
    <a
      className="btn btn-outline btn-outline-warning btn-icon-warning btn-active-warning px-2"
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
    <DropdownItem
      href={row.payment_url}
      target="_self"
      rel="noopener noreferrer"
    >
      <span className="svg-icon svg-icon-2">
        <MoneyIcon weight="bold" />
      </span>
      {translate('Pay')}
    </DropdownItem>
  );
};
