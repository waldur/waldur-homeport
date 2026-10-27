import { FC } from 'react';
import { Card } from 'react-bootstrap';
import type { ArrowCustomerMapping } from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

import { defaultCurrency } from '@/core/formatCurrency';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { Field } from '@/resource/summary';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import { SimpleTable } from '@/table/SimpleTable';

import { useFetchCustomerArrowData } from '../api';

type ArrowData = NonNullable<
  ReturnType<typeof useFetchCustomerArrowData>['data']
>;
type BillingLine = ArrowData['billing_lines'][number];
type ConsumptionLine = ArrowData['consumption_lines'][number];

// The card header above each table shows its total.
const BillingLinesTable: FC<{ lines: BillingLine[] }> = ({ lines }) => (
  <SimpleTable<BillingLine>
    columns={[
      {
        title: translate('Vendor'),
        render: ({ row }) => <>{row.vendor_name || DASH_ESCAPE_CODE}</>,
      },
      {
        title: translate('License Reference'),
        render: ({ row }) => (
          <span title={row.license_reference}>
            {row.license_reference || DASH_ESCAPE_CODE}
          </span>
        ),
      },
      {
        title: translate('SKU'),
        render: ({ row }) => <>{row.offer_sku || DASH_ESCAPE_CODE}</>,
      },
      {
        title: translate('Qty'),
        className: 'text-end',
        headerClassName: 'text-end',
        render: ({ row }) => <>{row.quantity ? String(row.quantity) : '1'}</>,
      },
      {
        title: translate('Sell'),
        className: 'text-end',
        headerClassName: 'text-end',
        render: ({ row }) => (
          <>
            {row.sell_price
              ? defaultCurrency(row.sell_price)
              : DASH_ESCAPE_CODE}
          </>
        ),
      },
    ]}
    rows={lines}
  />
);

const ConsumptionLinesTable: FC<{
  lines: ConsumptionLine[];
}> = ({ lines }) => (
  <SimpleTable<ConsumptionLine>
    columns={[
      {
        title: translate('Resource'),
        render: ({ row }) => <>{row.resource_name || DASH_ESCAPE_CODE}</>,
      },
      {
        title: translate('License Reference (backend_id)'),
        render: ({ row }) => <>{row.license_reference}</>,
      },
      {
        title: translate('Sell'),
        className: 'text-end',
        headerClassName: 'text-end',
        render: ({ row }) =>
          row.sell_price ? (
            <>{defaultCurrency(row.sell_price)}</>
          ) : row.error ? (
            <span className="text-danger" title={row.error}>
              {translate('Error')}
            </span>
          ) : (
            <>{DASH_ESCAPE_CODE}</>
          ),
      },
    ]}
    rows={lines}
  />
);

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
        <div className="flex flex-col gap-5">
          {/* Error message if any (only show for unexpected errors) */}
          {data.error && !data.error.includes('billing') && (
            <AlertItem
              type="floating"
              variant="warning"
              title={translate('Warning:')}
              body={data.error}
            />
          )}

          {/* Header info */}
          <Card>
            <Card.Body>
              {/* Who the mapping links, beside what the period holds. */}
              <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
                <div>
                  <Field
                    label={translate('Arrow Reference')}
                    value={data.arrow_reference}
                    labelCol={6}
                    valueCol={6}
                    space={1.5}
                  />
                  <Field
                    label={translate('Arrow Company')}
                    value={data.arrow_company_name}
                    labelCol={6}
                    valueCol={6}
                    space={1.5}
                  />
                  <Field
                    label={translate('Waldur Organization')}
                    value={data.waldur_customer_name}
                    labelCol={6}
                    valueCol={6}
                    space={1.5}
                  />
                </div>
                <div>
                  <Field
                    label={translate('Period')}
                    value={<strong>{data.period}</strong>}
                    labelCol={6}
                    valueCol={6}
                    space={1.5}
                  />
                  <Field
                    label={translate('Total resources')}
                    value={data.total_customer_resources}
                    labelCol={6}
                    valueCol={6}
                    space={1.5}
                  />
                  <Field
                    label={translate('With license ref (backend_id)')}
                    value={data.resources_with_backend_id}
                    labelCol={6}
                    valueCol={6}
                    space={1.5}
                  />
                  <Field
                    label={translate('Consumption fetched')}
                    value={
                      <strong
                        className={
                          data.matched_resources > 0
                            ? 'text-success'
                            : 'text-quaternary'
                        }
                      >
                        {data.matched_resources}
                      </strong>
                    }
                    labelCol={6}
                    valueCol={6}
                    space={0}
                  />
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* How it works explanation */}
          {data.resources_with_backend_id === 0 &&
            data.total_customer_resources > 0 && (
              <AlertItem
                type="floating"
                variant="info"
                className="mb-0"
                title={translate('How resource linking works:')}
                body={
                  <>
                    <p className="mb-1.5 mt-1.5">
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
                  </>
                }
              />
            )}

          {/* Billing Data from Arrow */}
          <Card>
            <Card.Header className="flex justify-between items-center">
              <Card.Title>
                <h5 className="mb-0">
                  {translate('Billing export ({period})', {
                    period: data.period,
                  })}
                </h5>
              </Card.Title>
              {data.billing_available && data.billing_lines.length > 0 && (
                <div className="text-end">
                  <div className="small text-quaternary">
                    {translate('Total')}
                  </div>
                  <strong>{defaultCurrency(data.billing_total_sell)}</strong>
                </div>
              )}
            </Card.Header>
            <Card.Body className="p-0">
              {!data.billing_available ? (
                <div className="text-center text-quaternary py-5">
                  {translate(
                    'Billing export not available yet for this period. Final billing data is typically available after the month ends.',
                  )}
                </div>
              ) : data.billing_lines.length === 0 ? (
                <div className="text-center text-quaternary py-5">
                  {translate(
                    'No billing lines found for this customer in the current period',
                  )}
                </div>
              ) : (
                <BillingLinesTable lines={data.billing_lines} />
              )}
            </Card.Body>
          </Card>

          {/* Consumption Data */}
          <Card>
            <Card.Header className="flex justify-between items-center">
              <Card.Title>
                <h5 className="mb-0">
                  {translate('Consumption ({period})', { period: data.period })}
                </h5>
              </Card.Title>
              {data.consumption_lines.length > 0 &&
                data.consumption_total_sell && (
                  <div className="text-end">
                    <div className="small text-quaternary">
                      {translate('Total')}
                    </div>
                    <strong>
                      {defaultCurrency(data.consumption_total_sell)}
                    </strong>
                  </div>
                )}
            </Card.Header>
            <Card.Body className="p-0">
              {data.consumption_lines.length === 0 ? (
                <div className="text-center text-quaternary py-5">
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
                <ConsumptionLinesTable lines={data.consumption_lines} />
              )}
            </Card.Body>
          </Card>

          {/* Empty state */}
          {data.billing_lines.length === 0 &&
            data.consumption_lines.length === 0 &&
            !data.error && (
              <div className="text-center text-quaternary py-5">
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
