import { FC, useState } from 'react';

import { defaultCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';

import { Invoice } from '../types';

import { InvoiceItemsTable } from './InvoiceItemsTable';

interface BillingRecordDetailsProps {
  invoice: Invoice;
  refreshInvoiceItems(): void;
}

export const BillingRecordDetails: FC<BillingRecordDetailsProps> = ({
  invoice,
  refreshInvoiceItems,
}) => {
  const [totalFiltered, setTotalFiltered] = useState<number | null>(null);

  return (
    <InvoiceItemsTable
      invoice={invoice}
      refreshInvoiceItems={refreshInvoiceItems}
      showPrice={true}
      showVat={false}
      setTotalFiltered={setTotalFiltered}
      footer={
        <table className="table bg-secondary border-t-[1px] border-t-secondary border-b-[1px] border-b-secondary align-middle">
          <tbody>
            <tr className="text-sm font-medium">
              {totalFiltered !== null && (
                <td className="text-primary">
                  <span>{translate('Total filtered')}</span>{' '}
                  <small>{translate('(VAT is not included)')}</small>
                  {': '}
                  <span className="text-end text-primary whitespace-nowrap min-w-[125px]">
                    {defaultCurrency(totalFiltered)}
                  </span>
                </td>
              )}

              <td className="text-end text-primary">
                <span>{translate('Total')}</span>{' '}
                <small>{translate('(VAT is not included)')}</small>:
              </td>
              <td
                width="12%"
                className="text-end text-primary whitespace-nowrap min-w-[150px]"
              >
                {defaultCurrency(invoice.price)}
              </td>
            </tr>
          </tbody>
        </table>
      }
    />
  );
};
