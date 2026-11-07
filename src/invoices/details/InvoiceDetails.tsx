import { useState } from 'react';

import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from 'waldur-ui';

import { defaultCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';
import { renderFieldOrDash } from '@/table/utils';
import { useCustomer } from '@/workspace/hooks';

import { Invoice } from '../types';

import { CustomerDetails } from './CustomerDetails';
import { InvoiceItemsTable } from './InvoiceItemsTable';
import { getActiveFixedPricePaymentProfile, isOpenInvoice } from './utils';
import { VolumeDiscountsRow } from './VolumeDiscountsRow';

export const InvoiceDetails = ({
  invoice,
  refreshInvoiceItems,
}: {
  invoice: Invoice;
  refreshInvoiceItems(): void;
}) => {
  const customer = useCustomer();
  const showPrice = !getActiveFixedPricePaymentProfile(
    customer.payment_profiles,
  );

  const [totalFiltered, setTotalFiltered] = useState<number | null>(null);
  const isOpen = isOpenInvoice(invoice);

  return (
    <>
      <Card bordered className="mb-4">
        <CardContent className="flex">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 grow">
            {invoice.customer_details && (
              <div>
                <div className="text-base mb-2.5 uppercase">
                  {translate('Invoice to')}
                </div>
                <CustomerDetails customer={invoice.customer_details} />
              </div>
            )}
            {invoice.issuer_details && (
              <div>
                <div className="text-base mb-2.5 uppercase">
                  {translate('Invoice from')}
                </div>
                <CustomerDetails customer={invoice.issuer_details} />
              </div>
            )}
          </div>

          <div className="ms-auto">
            <strong>{translate('Invoice date')}: </strong>
            {renderFieldOrDash(invoice.invoice_date)}
            <br />
            <strong>{translate('Due date')}: </strong>
            {renderFieldOrDash(invoice.due_date)}
          </div>
        </CardContent>
      </Card>
      <InvoiceItemsTable
        invoice={invoice}
        invoiceView
        refreshInvoiceItems={refreshInvoiceItems}
        showPrice={showPrice}
        showVat={Boolean(invoice.issuer_details.vat_code)}
        setTotalFiltered={setTotalFiltered}
        footer={
          showPrice && (
            <Table
              scrollable={false}
              className="bg-secondary border-t border-t-secondary border-b border-b-secondary align-middle"
            >
              <TableBody>
                <TableRow hoverable={false} className="text-sm font-medium">
                  {totalFiltered !== null && (
                    <TableCell className="text-primary">
                      <span>{translate('Total filtered')}</span>
                      {': '}
                      <span className="text-end text-primary whitespace-nowrap min-w-[125px]">
                        {defaultCurrency(totalFiltered)}
                      </span>
                    </TableCell>
                  )}

                  <TableCell className="text-end text-primary">
                    <span>{translate('Subtotal')}:</span>
                  </TableCell>
                  <TableCell
                    width="12%"
                    className="text-end text-primary whitespace-nowrap min-w-[150px] border-b border-b-secondary"
                  >
                    {defaultCurrency(invoice.price)}
                  </TableCell>
                </TableRow>
                <VolumeDiscountsRow
                  invoice={invoice}
                  labelColSpan={totalFiltered === null ? 1 : 2}
                  includedIn="subtotal"
                />
                <TableRow hoverable={false} className="text-sm font-medium">
                  <TableCell
                    className="text-end text-primary"
                    colSpan={totalFiltered === null ? 1 : 2}
                  >
                    <span>{translate('Tax')}:</span>
                  </TableCell>
                  <TableCell
                    width="12%"
                    className="text-end text-primary whitespace-nowrap min-w-[150px] border-b border-b-secondary"
                  >
                    {defaultCurrency(invoice.tax)}
                  </TableCell>
                </TableRow>
                <TableRow hoverable={false} className="text-sm font-medium">
                  <TableCell
                    className="text-end text-primary"
                    colSpan={totalFiltered === null ? 1 : 2}
                  >
                    <span>
                      {isOpen
                        ? translate('Expected total')
                        : translate('Total')}
                      :
                    </span>
                  </TableCell>
                  <TableCell
                    width="12%"
                    className="text-end text-primary whitespace-nowrap min-w-[150px]"
                  >
                    {defaultCurrency(invoice.total)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )
        }
      />
    </>
  );
};
