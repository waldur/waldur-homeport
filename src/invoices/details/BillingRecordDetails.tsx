import { FC, useState } from 'react';

import { Table, TableBody, TableCell, TableRow } from 'waldur-ui';

import { defaultCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';

import { Invoice } from '../types';

import { InvoiceItemsTable } from './InvoiceItemsTable';
import { isOpenInvoice } from './utils';
import { VolumeDiscountsRow } from './VolumeDiscountsRow';

interface BillingRecordDetailsProps {
  invoice: Invoice;
  refreshInvoiceItems(): void;
}

export const BillingRecordDetails: FC<BillingRecordDetailsProps> = ({
  invoice,
  refreshInvoiceItems,
}) => {
  const [totalFiltered, setTotalFiltered] = useState<number | null>(null);
  const isOpen = isOpenInvoice(invoice);

  return (
    <InvoiceItemsTable
      invoice={invoice}
      refreshInvoiceItems={refreshInvoiceItems}
      showPrice={true}
      showVat={false}
      setTotalFiltered={setTotalFiltered}
      footer={
        <Table
          scrollable={false}
          className="bg-secondary border-t border-t-secondary border-b border-b-secondary align-middle"
        >
          <TableBody>
            <VolumeDiscountsRow
              invoice={invoice}
              labelColSpan={totalFiltered === null ? 1 : 2}
              includedIn="total"
            />
            <TableRow hoverable={false} className="text-sm font-medium">
              {totalFiltered !== null && (
                <TableCell className="text-primary">
                  <span>{translate('Total filtered')}</span>{' '}
                  <small>{translate('(VAT is not included)')}</small>
                  {': '}
                  <span className="text-end text-primary whitespace-nowrap min-w-[125px]">
                    {defaultCurrency(totalFiltered)}
                  </span>
                </TableCell>
              )}

              <TableCell className="text-end text-primary">
                <span>
                  {isOpen ? translate('Expected total') : translate('Total')}
                </span>{' '}
                <small>{translate('(VAT is not included)')}</small>:
              </TableCell>
              <TableCell
                width="12%"
                className="text-end text-primary whitespace-nowrap min-w-[150px]"
              >
                {defaultCurrency(invoice.price)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      }
    />
  );
};
