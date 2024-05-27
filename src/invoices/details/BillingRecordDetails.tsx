import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';
import { CustomerDetails } from '@waldur/invoices/details/CustomerDetails';
import { PriceTooltip } from '@waldur/price/PriceTooltip';
import { getCustomer } from '@waldur/workspace/selectors';

import { Invoice } from '../types';
import { formatPeriod } from '../utils';

import { ResourceRow } from './ResourceRow';
import { groupInvoiceItems } from './utils';

interface BillingRecordDetailsProps {
  invoice: Invoice;
  refreshInvoiceItems(): void;
}

export const BillingRecordDetails: FunctionComponent<
  BillingRecordDetailsProps
> = ({ invoice, refreshInvoiceItems }) => {
  const customer = useSelector(getCustomer);
  const projects = useMemo(
    () => groupInvoiceItems(invoice.items),
    [invoice.items],
  );

  return (
    <div className="row">
      <div className="col-lg-12">
        <div className="invoice-details">
          <div className="invoice-details-content">
            <div className="card">
              <div className="card-body">
                <div className="p-xs">
                  <div className="row">
                    <div className="text-end">
                      {customer.agreement_number && (
                        <h4>
                          {translate('Agreement number')}{' '}
                          {customer.agreement_number}
                        </h4>
                      )}
                      <h4>
                        {translate('Record no.')} {invoice.number}
                      </h4>
                      <div>
                        <span>
                          <strong>{translate('Record period')}</strong>:{' '}
                          {formatPeriod(invoice)}
                        </span>
                      </div>
                    </div>
                    <div className="fs-5 mb-3 text-start">
                      {invoice.customer_details && (
                        <div>
                          {translate('For')}:{' '}
                          <CustomerDetails
                            customer={invoice.customer_details}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="table-responsive m-t">
                    <table className="table invoice-table">
                      <thead>
                        <tr>
                          <th>{translate('Item')}</th>
                          <th>{translate('Unit')}</th>
                          <th>{translate('Quantity')}</th>
                          <th>{translate('Unit price')}</th>
                          <th>
                            <PriceTooltip /> {translate('Total price')}
                          </th>
                        </tr>
                      </thead>
                      {projects.map((project, projectIndex) => (
                        <tbody key={projectIndex}>
                          {project.name ? (
                            <tr>
                              <td colSpan={4}>
                                <h3>{project.name}</h3>
                                <p>
                                  {translate('Project price')}
                                  {': '}
                                  {defaultCurrency(project.price)}
                                </p>
                              </td>
                            </tr>
                          ) : null}
                          {project.resources.map((resource, resourceIndex) => (
                            <ResourceRow
                              key={resourceIndex}
                              invoice={invoice}
                              resource={resource}
                              showPrice={true}
                              showVat={false}
                              refreshInvoiceItems={refreshInvoiceItems}
                            />
                          ))}
                        </tbody>
                      ))}
                    </table>
                  </div>

                  <table className="table invoice-total">
                    <tbody>
                      <tr>
                        <td>
                          <strong>{translate('TOTAL')}</strong>{' '}
                          <small>{translate('(VAT is not included)')}</small>:
                        </td>
                        <td>{defaultCurrency(invoice.price)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
