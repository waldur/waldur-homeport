import * as React from 'react';
import { useSelector } from 'react-redux';

import { defaultCurrency } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { PriceTooltip } from '@waldur/price/PriceTooltip';
import { getCustomer } from '@waldur/workspace/selectors';

import './BillingRecordDetails.css';
import { Invoice, InvoiceItem } from '../types';
import { formatPeriod } from '../utils';

import { CustomerDetails } from './CustomerDetails';
import { InvoiceItemDetails } from './InvoiceItemDetails';
import { groupInvoiceItems } from './utils';

export const BillingRecordDetails = ({ invoice }: { invoice: Invoice }) => {
  const customer = useSelector(getCustomer);
  const projects = React.useMemo(() => groupInvoiceItems(invoice.items), [
    invoice.items,
  ]);
  return (
    <div className="row">
      <div className="col-lg-12">
        <div className="wrapper wrapper-content">
          <div className="p-xl">
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
                    <th>{translate('Quantity')}</th>
                    <th>{translate('Unit price')}</th>
                    <th>
                      <PriceTooltip /> <span>{translate('Total price')}</span>
                    </th>
                  </tr>
                </thead>
                {projects.map((project, projectIndex) => (
                  <tbody key={projectIndex}>
                    {project.name ? (
                      <tr className="project">
                        <td colSpan={4}>
                          <h3>{project.name}</h3>
                        </td>
                      </tr>
                    ) : null}
                    {project.items.map((item: InvoiceItem, itemIndex) => (
                      <tr key={itemIndex}>
                        <td>
                          <InvoiceItemDetails
                            item={item}
                            itemId={`item-${projectIndex}-${itemIndex}`}
                          />
                        </td>
                        <td>{item.factor || item.quantity}</td>
                        <td>{defaultCurrency(item.unit_price)}</td>
                        <td>{defaultCurrency(item.price)}</td>
                      </tr>
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
  );
};
