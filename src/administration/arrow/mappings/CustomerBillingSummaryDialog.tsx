import { FC } from 'react';
import { Alert, Card, Table } from 'react-bootstrap';
import type { ArrowCustomerMapping } from 'waldur-js-client';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';

import { useFetchCustomerArrowData } from '../api';

interface CustomerBillingSummaryDialogProps {
  resolve: {
    mapping: ArrowCustomerMapping;
  };
}

export const CustomerBillingSummaryDialog: FC<
  CustomerBillingSummaryDialogProps
> = ({ resolve }) => {
  const { mapping } = resolve;
  const { data, isLoading, error, refetch } = useFetchCustomerArrowData(
    mapping.uuid,
  );

  return (
    <ModalDialog
      title={translate('Billing summary: {name}', {
        name: mapping.arrow_company_name,
      })}
      closeButton
      footer={<CloseDialogButton label={translate('Close')} />}
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <LoadingErred
          message={translate('Failed to load data from Arrow')}
          loadData={refetch}
        />
      ) : data ? (
        <div className="d-flex flex-column gap-6">
          {/* Error message if any (only show for unexpected errors) */}
          {data.error && !data.error.includes('billing') && (
            <Alert variant="warning">
              <strong>{translate('Warning:')}</strong> {data.error}
            </Alert>
          )}

          {/* Header info */}
          <Card>
            <Card.Body>
              <div className="row">
                <div className="col-md-6">
                  <Table borderless size="sm" className="mb-0">
                    <tbody>
                      <tr>
                        <td className="text-muted">
                          {translate('Arrow Reference')}
                        </td>
                        <td>
                          <code>{data.arrow_reference}</code>
                        </td>
                      </tr>
                      <tr>
                        <td className="text-muted">
                          {translate('Arrow Company')}
                        </td>
                        <td>{data.arrow_company_name}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">
                          {translate('Waldur Organization')}
                        </td>
                        <td>{data.waldur_customer_name}</td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
                <div className="col-md-6">
                  <Table borderless size="sm" className="mb-0">
                    <tbody>
                      <tr>
                        <td className="text-muted">{translate('Period')}</td>
                        <td>
                          <strong>{data.period}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td className="text-muted">
                          {translate('Total resources')}
                        </td>
                        <td>{data.total_customer_resources}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">
                          {translate('With license ref (backend_id)')}
                        </td>
                        <td>{data.resources_with_backend_id}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">
                          {translate('Consumption fetched')}
                        </td>
                        <td>
                          <strong
                            className={
                              data.matched_resources > 0
                                ? 'text-success'
                                : 'text-muted'
                            }
                          >
                            {data.matched_resources}
                          </strong>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* How it works explanation */}
          {data.resources_with_backend_id === 0 &&
            data.total_customer_resources > 0 && (
              <Alert variant="info" className="mb-0">
                <strong>{translate('How resource linking works:')}</strong>
                <p className="mb-2 mt-2">
                  {translate(
                    'Resources are linked to Arrow via their backend_id field, which should contain the Arrow License Reference (e.g., XSP12345).',
                  )}
                </p>
                <p className="mb-0">
                  {translate(
                    'None of your {count} resources have a backend_id set. Set the backend_id to the Arrow license reference to enable consumption tracking.',
                    { count: data.total_customer_resources },
                  )}
                </p>
              </Alert>
            )}

          {/* Billing Data from Arrow */}
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <Card.Title>
                <h5 className="mb-0">
                  {translate('Billing export ({period})', {
                    period: data.period,
                  })}
                </h5>
              </Card.Title>
              {data.billing_available && data.billing_lines.length > 0 && (
                <div className="text-end">
                  <div className="small text-muted">{translate('Total')}</div>
                  <strong>{defaultCurrency(data.billing_total_sell)}</strong>
                </div>
              )}
            </Card.Header>
            <Card.Body className="p-0">
              {!data.billing_available ? (
                <div className="text-center text-muted py-6">
                  {translate(
                    'Billing export not available yet for this period. Final billing data is typically available after the month ends.',
                  )}
                </div>
              ) : data.billing_lines.length === 0 ? (
                <div className="text-center text-muted py-6">
                  {translate(
                    'No billing lines found for this customer in the current period',
                  )}
                </div>
              ) : (
                <div className="table-responsive">
                  <Table className="mb-0" size="sm">
                    <thead>
                      <tr>
                        <th>{translate('Vendor')}</th>
                        <th>{translate('License Reference')}</th>
                        <th>{translate('SKU')}</th>
                        <th className="text-end">{translate('Qty')}</th>
                        <th className="text-end">{translate('Sell')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.billing_lines.map((line, idx) => (
                        <tr key={idx}>
                          <td>{line.vendor_name || DASH_ESCAPE_CODE}</td>
                          <td>
                            <code
                              className="small"
                              title={line.license_reference}
                            >
                              {line.license_reference || DASH_ESCAPE_CODE}
                            </code>
                          </td>
                          <td>{line.offer_sku || DASH_ESCAPE_CODE}</td>
                          <td className="text-end">
                            {line.quantity ? String(line.quantity) : '1'}
                          </td>
                          <td className="text-end fw-semibold">
                            {line.sell_price
                              ? defaultCurrency(line.sell_price)
                              : DASH_ESCAPE_CODE}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-top">
                      <tr>
                        <td colSpan={4} className="text-end fw-bold">
                          {translate('Total')}
                        </td>
                        <td className="text-end fw-bold">
                          {defaultCurrency(data.billing_total_sell)}
                        </td>
                      </tr>
                    </tfoot>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Consumption Data */}
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <Card.Title>
                <h5 className="mb-0">
                  {translate('Consumption ({period})', { period: data.period })}
                </h5>
              </Card.Title>
              {data.consumption_lines.length > 0 &&
                data.consumption_total_sell && (
                  <div className="text-end">
                    <div className="small text-muted">{translate('Total')}</div>
                    <strong>
                      {defaultCurrency(data.consumption_total_sell)}
                    </strong>
                  </div>
                )}
            </Card.Header>
            <Card.Body className="p-0">
              {data.consumption_lines.length === 0 ? (
                <div className="text-center text-muted py-6">
                  {data.total_customer_resources === 0
                    ? translate(
                        'No resources found for this customer in Waldur',
                      )
                    : data.resources_with_backend_id === 0
                      ? translate(
                          'No resources have backend_id set. Set it to the Arrow license reference (e.g., XSP12345).',
                        )
                      : translate(
                          'No consumption data returned from Arrow API for the license references',
                        )}
                </div>
              ) : (
                <div className="table-responsive">
                  <Table className="mb-0" size="sm">
                    <thead>
                      <tr>
                        <th>{translate('Resource')}</th>
                        <th>{translate('License Reference (backend_id)')}</th>
                        <th className="text-end">{translate('Sell')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.consumption_lines.map((line, idx) => (
                        <tr key={idx}>
                          <td>{line.resource_name || DASH_ESCAPE_CODE}</td>
                          <td>
                            <code className="small">
                              {line.license_reference}
                            </code>
                          </td>
                          <td className="text-end fw-semibold">
                            {line.sell_price ? (
                              defaultCurrency(line.sell_price)
                            ) : line.error ? (
                              <span className="text-danger" title={line.error}>
                                {translate('Error')}
                              </span>
                            ) : (
                              DASH_ESCAPE_CODE
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    {data.consumption_total_sell && (
                      <tfoot className="border-top">
                        <tr>
                          <td colSpan={2} className="text-end fw-bold">
                            {translate('Total')}
                          </td>
                          <td className="text-end fw-bold">
                            {defaultCurrency(data.consumption_total_sell)}
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Empty state */}
          {data.billing_lines.length === 0 &&
            data.consumption_lines.length === 0 &&
            !data.error && (
              <div className="text-center text-muted py-6">
                {translate(
                  'No billing or consumption data found for this customer in the current period.',
                )}
              </div>
            )}
        </div>
      ) : null}
    </ModalDialog>
  );
};
