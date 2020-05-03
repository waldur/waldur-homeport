import * as React from 'react';

import { defaultCurrency } from '@waldur/core/services';
import { translate } from '@waldur/i18n';

import { Invoice, InvoiceItem } from '../types';

import { CustomerDetails } from './CustomerDetails';
import { InvoiceItemDetails } from './InvoiceItemDetails';
import { groupInvoiceItems } from './utils';

export const InvoiceDetails = ({ invoice }: { invoice: Invoice }) => {
  const projects = React.useMemo(() => groupInvoiceItems(invoice.items), [
    invoice.items,
  ]);
  return (
    <div className="row">
      <div className="col-lg-12">
        <div className="wrapper wrapper-content">
          <div className="p-xl">
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
                  <th>{translate('Item')}</th>
                  <th>{translate('Quantity')}</th>
                  <th>{translate('Unit price')}</th>
                  {invoice.issuer_details.vat_code && (
                    <th>{translate('Tax')}</th>
                  )}
                  <th>{translate('Total price')}</th>
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
                      {invoice.issuer_details.vat_code && (
                        <td>{defaultCurrency(item.tax)}</td>
                      )}
                      <td>{defaultCurrency(item.total || item.price)}</td>
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
        </div>
      </div>
    </div>
  );
};
