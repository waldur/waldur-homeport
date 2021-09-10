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
  const projects = useMemo(() => groupInvoiceItems(invoice.items), [
    invoice.items,
  ]);
  const customer = useSelector(getCustomer);
  const showPrice = !getActiveFixedPricePaymentProfile(
    customer.payment_profiles,
  );

  return (
    <div className="row">
      <div className="col-lg-12">
        <div className="invoice-details">
          <div className="wrapper wrapper-content invoice-details-content">
            <div className="p-xs">
              <div className="row">
                <div className="col-sm-6">
                  <h5>{translate('From')}: </h5>
                  <CustomerDetails customer={invoice.issuer_details} />
                </div>
                <div className="col-sm-6 text-right">
                  {invoice.number && (
                    <>
                      <h4>{translate('Invoice No.')}</h4>
                      <h4 className="text-navy">{invoice.number}</h4>
                    </>
                  )}
                  {translate('To')}:{' '}
                  <CustomerDetails customer={invoice.customer_details} />
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
                          <h3>{project.name}</h3>
                          {showPrice && (
                            <p>
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
          </div>
        </div>
      </div>
    </div>
  );
};
