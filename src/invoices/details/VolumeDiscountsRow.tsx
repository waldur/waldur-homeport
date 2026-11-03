import { FC } from 'react';

import { defaultCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';

import { Invoice } from '../types';

import { isOpenInvoice } from './utils';

// defaultCurrency prints up to four decimals for a small amount, so only
// below that would the row read as a zero discount.
const hasVolumeDiscounts = (invoice: Pick<Invoice, 'volume_discounts'>) =>
  Math.abs(Number(invoice.volume_discounts ?? 0)) >= 0.00005;

/**
 * Footer row with what the invoice's volume discount lines take off. The
 * amount is already part of the total the footer shows; on an open invoice
 * it is an estimate.
 */
export const VolumeDiscountsRow: FC<{
  invoice: Pick<Invoice, 'state' | 'volume_discounts'>;
  labelColSpan: number;
  includedIn: 'subtotal' | 'total';
}> = ({ invoice, labelColSpan, includedIn }) => {
  if (!hasVolumeDiscounts(invoice)) {
    return null;
  }
  return (
    <tr className="text-sm font-medium">
      <td className="text-end text-primary" colSpan={labelColSpan}>
        <span>
          {isOpenInvoice(invoice)
            ? translate('Estimated volume discounts')
            : translate('Volume discounts')}
        </span>{' '}
        <small>
          {includedIn === 'subtotal'
            ? translate('(included in subtotal)')
            : translate('(included in total)')}
        </small>
        :
      </td>
      <td
        width="12%"
        className="text-end text-success whitespace-nowrap min-w-[150px] border-b border-b-secondary"
      >
        {defaultCurrency(invoice.volume_discounts)}
      </td>
    </tr>
  );
};
