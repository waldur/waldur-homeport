import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';
import { PriceTooltip } from '@waldur/price/PriceTooltip';
import { getCustomer } from '@waldur/workspace/selectors';

import { Invoice } from '../types';
import { formatPeriod } from '../utils';

import { CustomerDetails } from './CustomerDetails';
import { ResourceRow } from './ResourceRow';
import { groupInvoiceItems } from './utils';

interface BillingRecordDetailsProps {
  invoice: Invoice;
  refreshInvoiceItems(): void;
}

export const BillingRecordDetails: FunctionComponent<BillingRecordDetailsProps> =
  ({ invoice, refreshInvoiceItems }) => {
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
              <div className="p-xs">
                <div className="row">
                  <div className="col-sm-6 text-right col-sm-offset-6">
                    <h4>{customer.name}</h4>
                    {customer.agreement_number && (
                      <>
                        <h4>
                          {translate('Agreement number')}{' '}
                          {customer.agreement_number}
                        </h4>
                      </>
                    )}
                    <h4>{translate('Record no.')}</h4>
                    <h4 className="text-navy">{invoice.number}</h4>
                    {invoice.customer_details && (
                      <div>
                        {translate('For')}:{' '}
                        <CustomerDetails customer={invoice.customer_details} />
                      </div>
                    )}
                    <div>
                      <span>
                        <strong>{translate('Record period')}</strong>:{' '}
                        {formatPeriod(invoice)}
                      </span>
                    </div>
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
                          <PriceTooltip /> <>{translate('Total price')}</>
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
                            customer={customer}
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
    );
  };
