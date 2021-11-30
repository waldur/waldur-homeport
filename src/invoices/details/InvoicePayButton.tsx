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
      className="btn btn-warning btn-sm"
      href={invoice.payment_url}
      target="_blank"
      rel="noopener noreferrer"
    >
      <i className="fa fa-money" /> {translate('Pay')}
    </a>
  );
};
