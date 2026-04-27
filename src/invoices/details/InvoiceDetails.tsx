import { useState } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { defaultCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';
import { renderFieldOrDash } from '@/table/utils';
import { getCustomer } from '@/workspace/selectors';

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
  const customer = useSelector(getCustomer);
  const showPrice = !getActiveFixedPricePaymentProfile(
    customer.payment_profiles,
  );

  const [totalFiltered, setTotalFiltered] = useState<number | null>(null);

  return (
    <>
      <Card className="card-bordered mb-5">
        <Card.Body className="d-flex">
          <Row>
            {invoice.customer_details && (
              <Col>
                <div className="fs-5 mb-3 text-uppercase">
                  {translate('Invoice to')}
                </div>
                <CustomerDetails customer={invoice.customer_details} />
              </Col>
            )}
            {invoice.issuer_details && (
              <Col>
                <div className="fs-5 mb-3 text-uppercase">
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
            <table className="table bg-gray-50 border-top border-bottom align-middle">
              <tbody>
                <tr className="fs-6 fw-bold">
                  {totalFiltered !== null && (
                    <td className="text-dark">
                      <span>{translate('Total filtered')}</span>
                      {': '}
                      <span className="text-end text-dark text-nowrap min-w-125px">
                        {defaultCurrency(totalFiltered)}
                      </span>
                    </td>
                  )}

                  <td className="text-end text-dark">
                    <span>{translate('Subtotal')}:</span>
                  </td>
                  <td
                    width="12%"
                    className="text-end text-dark text-nowrap min-w-150px border-bottom"
                  >
                    {defaultCurrency(invoice.price)}
                  </td>
                </tr>
                <tr className="fs-6 fw-bold">
                  <td
                    className="text-end text-dark"
                    colSpan={totalFiltered === null ? 1 : 2}
                  >
                    <span>{translate('Tax')}:</span>
                  </td>
                  <td
                    width="12%"
                    className="text-end text-dark text-nowrap min-w-150px border-bottom"
                  >
                    {defaultCurrency(invoice.tax)}
                  </td>
                </tr>
                <tr className="fs-6 fw-bold">
                  <td
                    className="text-end text-dark"
                    colSpan={totalFiltered === null ? 1 : 2}
                  >
                    <span>{translate('Total')}:</span>
                  </td>
                  <td
                    width="12%"
                    className="text-end text-dark text-nowrap min-w-150px"
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
