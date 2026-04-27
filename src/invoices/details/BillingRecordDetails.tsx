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
        <table className="table bg-gray-50 border-top border-bottom align-middle">
          <tbody>
            <tr className="fs-6 fw-bold">
              {totalFiltered !== null && (
                <td className="text-dark">
                  <span>{translate('Total filtered')}</span>{' '}
                  <small>{translate('(VAT is not included)')}</small>
                  {': '}
                  <span className="text-end text-dark text-nowrap min-w-125px">
                    {defaultCurrency(totalFiltered)}
                  </span>
                </td>
              )}

              <td className="text-end text-dark">
                <span>{translate('Total')}</span>{' '}
                <small>{translate('(VAT is not included)')}</small>:
              </td>
              <td
                width="12%"
                className="text-end text-dark text-nowrap min-w-150px"
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
