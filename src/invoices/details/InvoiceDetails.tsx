import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';
import { getCustomer } from '@waldur/workspace/selectors';

import { Invoice, InvoiceItem } from '../types';

import { CustomerDetails } from './CustomerDetails';
import { InvoiceItemDetails } from './InvoiceItemDetails';
import { getActiveFixedPricePaymentProfile, groupInvoiceItems } from './utils';

export const InvoiceDetails = ({ invoice }: { invoice: Invoice }) => {
  const projects = useMemo(() => groupInvoiceItems(invoice.items), [
    invoice.items,
  ]);
  const customer = useSelector(getCustomer);
  const activeFixedPriceProfile = getActiveFixedPricePaymentProfile(
    customer.payment_profiles,
  );

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
                  <th>{translate('Unit')}</th>
                  <th>{translate('Quantity')}</th>
                  {!activeFixedPriceProfile && (
                    <>
                      <th>{translate('Unit price')}</th>
                      {invoice.issuer_details.vat_code && (
                        <th>{translate('Tax')}</th>
                      )}
                      <th>{translate('Total price')}</th>
                    </>
                  )}
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
                          customerId={customer.uuid}
                          item={item}
                          itemId={`item-${projectIndex}-${itemIndex}`}
                        />
                      </td>
                      <td>{item.measured_unit}</td>
                      <td>{item.factor || item.quantity}</td>
                      {!activeFixedPriceProfile && (
                        <>
                          <td>{defaultCurrency(item.unit_price)}</td>
                          {invoice.issuer_details.vat_code && (
                            <td>{defaultCurrency(item.tax)}</td>
                          )}
                          <td>{defaultCurrency(item.total || item.price)}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>

          {!activeFixedPriceProfile && (
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
  );
};
