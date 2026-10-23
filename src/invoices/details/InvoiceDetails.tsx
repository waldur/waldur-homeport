import { useState } from 'react';
import { Card, Col, Row } from 'react-bootstrap';

import { defaultCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';
import { renderFieldOrDash } from '@/table/utils';
import { useCustomer } from '@/workspace/hooks';

import { Invoice } from '../types';

import { CustomerDetails } from './CustomerDetails';
import { InvoiceItemsTable } from './InvoiceItemsTable';
import { getActiveFixedPricePaymentProfile } from './utils';

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

  return (
    <>
      <Card className="card-bordered mb-5">
        <Card.Body className="flex">
          <Row>
            {invoice.customer_details && (
              <Col>
                <div className="text-base mb-3 text-uppercase">
                  {translate('Invoice to')}
                </div>
                <CustomerDetails customer={invoice.customer_details} />
              </Col>
            )}
            {invoice.issuer_details && (
              <Col>
                <div className="text-base mb-3 text-uppercase">
                  {translate('Invoice from')}
                </div>
                <CustomerDetails customer={invoice.issuer_details} />
              </Col>
            )}
          </Row>

          <div className="ms-auto">
            <strong>{translate('Invoice date')}: </strong>
            {renderFieldOrDash(invoice.invoice_date)}
            <br />
            <strong>{translate('Due date')}: </strong>
            {renderFieldOrDash(invoice.due_date)}
          </div>
        </Card.Body>
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
            <table className="table bg-secondary border-t-[1px] border-t-secondary border-b-[1px] border-b-secondary align-middle">
              <tbody>
                <tr className="text-sm font-medium">
                  {totalFiltered !== null && (
                    <td className="text-primary">
                      <span>{translate('Total filtered')}</span>
                      {': '}
                      <span className="text-end text-primary text-nowrap min-w-[125px]">
                        {defaultCurrency(totalFiltered)}
                      </span>
                    </td>
                  )}

                  <td className="text-end text-primary">
                    <span>{translate('Subtotal')}:</span>
                  </td>
                  <td
                    width="12%"
                    className="text-end text-primary text-nowrap min-w-[150px] border-b-[1px] border-b-secondary"
                  >
                    {defaultCurrency(invoice.price)}
                  </td>
                </tr>
                <tr className="text-sm font-medium">
                  <td
                    className="text-end text-primary"
                    colSpan={totalFiltered === null ? 1 : 2}
                  >
                    <span>{translate('Tax')}:</span>
                  </td>
                  <td
                    width="12%"
                    className="text-end text-primary text-nowrap min-w-[150px] border-b-[1px] border-b-secondary"
                  >
                    {defaultCurrency(invoice.tax)}
                  </td>
                </tr>
                <tr className="text-sm font-medium">
                  <td
                    className="text-end text-primary"
                    colSpan={totalFiltered === null ? 1 : 2}
                  >
                    <span>{translate('Total')}:</span>
                  </td>
                  <td
                    width="12%"
                    className="text-end text-primary text-nowrap min-w-[150px]"
                  >
                    {defaultCurrency(invoice.total)}
                  </td>
                </tr>
              </tbody>
            </table>
          )
        }
      />
    </>
  );
};
