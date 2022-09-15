import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';
import { getCustomer } from '@waldur/workspace/selectors';

import { Invoice } from '../types';

import { CustomerDetails } from './CustomerDetails';
import { ResourceRow } from './ResourceRow';
import { getActiveFixedPricePaymentProfile, groupInvoiceItems } from './utils';

export const InvoiceDetails = ({
  invoice,
  refreshInvoiceItems,
}: {
  invoice: Invoice;
  refreshInvoiceItems(): void;
}) => {
  const projects = useMemo(
    () => groupInvoiceItems(invoice.items),
    [invoice.items],
  );
  const customer = useSelector(getCustomer);
  const showPrice = !getActiveFixedPricePaymentProfile(
    customer.payment_profiles,
  );

  return (
    <div className="invoice-details">
      <div className="invoice-details-content">
        <div className="card">
          <div className="card-body">
            <div className="p-xs">
              <div className="row">
                <div className="text-end">
                  {invoice.number && (
                    <>
                      <h4>
                        {translate('Invoice No.')} {invoice.number}
                      </h4>
                    </>
                  )}
                  <div>
                    <strong>{translate('Invoice date')}: </strong>
                    {invoice.invoice_date || '-'}
                    <br />
                    <strong>{translate('Due date')}: </strong>
                    {invoice.due_date || '-'}
                  </div>
                </div>
              </div>
            </div>

            <div className="table-responsive m-t">
              <table className="table invoice-table">
                <thead>
                  <tr>
                    <th colSpan={showPrice ? 5 : 6}>{translate('Item')}</th>
                    <th>{translate('Price')}</th>
                    <th></th>
                  </tr>
                </thead>
                {projects.map((project, projectIndex) => (
                  <tbody key={projectIndex}>
                    {project.name ? (
                      <tr>
                        <td colSpan={showPrice ? 6 : 7}>
                          <div className="fs-5 fw-bold text-dark mt-4">
                            {project.name}
                          </div>
                          {showPrice && (
                            <p className="mb-0">
                              {translate('Project price')}
                              {': '}
                              {defaultCurrency(project.total)}
                            </p>
                          )}
                        </td>
                      </tr>
                    ) : null}
                    {project.resources.map((resource, resourceIndex) => (
                      <ResourceRow
                        key={resourceIndex}
                        invoice={invoice}
                        resource={resource}
                        customer={customer}
                        showPrice={showPrice}
                        showVat={invoice.issuer_details.vat_code}
                        refreshInvoiceItems={refreshInvoiceItems}
                      />
                    ))}
                  </tbody>
                ))}
              </table>
            </div>

            {showPrice && (
              <table className="table invoice-total">
                <tbody>
                  <tr>
                    <td>
                      <strong>{translate('Subtotal')}</strong>{' '}
                    </td>
                    <td>{defaultCurrency(invoice.price)}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>{translate('TAX')}</strong>{' '}
                    </td>
                    <td>{defaultCurrency(invoice.tax)}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>{translate('TOTAL')}</strong>{' '}
                    </td>
                    <td>{defaultCurrency(invoice.total)}</td>
                  </tr>
                </tbody>
              </table>
            )}

            <div className="fs-5 mb-3 text-uppercase">
              {translate('Invoice to')}
            </div>
            <CustomerDetails customer={invoice.customer_details} />

            <div className="fs-5 mb-3 text-uppercase">
              {translate('Invoice from')}
            </div>
            <CustomerDetails customer={invoice.issuer_details} />
          </div>
        </div>
      </div>
    </div>
  );
};
