import { Money } from '@phosphor-icons/react';
import { FC } from 'react';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';

import { Invoice } from '../types';

import { hasMonthlyPaymentProfile } from './utils';

interface InvoicePayButtonProps {
  invoice: Invoice;
}

export const InvoicePayButton: FC<InvoicePayButtonProps> = ({ invoice }) => {
  const showPayment = useSelector(hasMonthlyPaymentProfile);
  if (!invoice?.payment_url || !showPayment || invoice.state !== 'created') {
    return null;
  }
  return (
    <a
      className="btn btn-outline btn-outline-warning border-warning btn-active-warning px-2',"
      href={invoice.payment_url}
      target="_self"
      rel="noopener noreferrer"
    >
      <span className="svg-icon svg-icon-2">
        <Money />
      </span>
      {translate('Pay')}
    </a>
  );
};
