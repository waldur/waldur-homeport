import { FC, useMemo } from 'react';
import type { ArrowCustomerMapping } from 'waldur-js-client';

import { AlertItem, Badge } from 'waldur-ui';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import { SimpleTable } from '@/table/SimpleTable';

import { useFetchCustomerArrowData } from '../api';

type ArrowData = NonNullable<
  ReturnType<typeof useFetchCustomerArrowData>['data']
>;
type ConsumptionLine = ArrowData['consumption_lines'][number];
type BillingLine = ArrowData['billing_lines'][number];

const formatSellPrice = (price: number | string) =>
  `€${Number(price).toFixed(2)}`;

const ConsumptionLinesTable: FC<{
  lines: ConsumptionLine[];
  billingLicenseRefs: Set<string>;
}> = ({ lines, billingLicenseRefs }) => (
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
        title: translate('In Billing'),
        render: ({ row }) =>
          billingLicenseRefs.has(row.license_reference) ? (
            <Badge variant="success" tone="outline">
              {translate('Yes')}
            </Badge>
          ) : (
            <Badge variant="neutral" tone="outline">
              {translate('No')}
            </Badge>
          ),
      },
      {
        title: translate('Consumption'),
        className: 'text-end',
        headerClassName: 'text-end',
        render: ({ row }) =>
          row.sell_price != null ? (
            <>{formatSellPrice(row.sell_price)}</>
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

const BillingLinesTable: FC<{
  lines: BillingLine[];
}> = ({ lines }) => (
  <SimpleTable<BillingLine>
    columns={[
      {
        title: translate('Vendor'),
        render: ({ row }) => <>{row.vendor_name || DASH_ESCAPE_CODE}</>,
      },
      {
        title: translate('License Reference'),
        render: ({ row }) => <>{row.license_reference || DASH_ESCAPE_CODE}</>,
      },
      {
        title: translate('SKU'),
        render: ({ row }) => <>{row.offer_sku || DASH_ESCAPE_CODE}</>,
      },
      {
        title: translate('Sell'),
        className: 'text-end',
        headerClassName: 'text-end',
        render: ({ row }) => (
          <>
            {row.sell_price != null
              ? formatSellPrice(row.sell_price)
              : DASH_ESCAPE_CODE}
          </>
        ),
      },
    ]}
    rows={lines}
  />
);

interface CustomerMappingExpandableRowProps {
  row: ArrowCustomerMapping;
}

export const CustomerMappingExpandableRow: FC<
  CustomerMappingExpandableRowProps
> = ({ row }) => {
  const { data, isLoading, error, refetch } = useFetchCustomerArrowData(
    row.uuid,
  );

  // Build set of license references that appear in billing
  const billingLicenseRefs = useMemo(() => {
    if (!data?.billing_lines) return new Set<string>();
    const set = new Set<string>();
    for (const line of data.billing_lines) {
      if (line.license_reference) {
        set.add(line.license_reference);
      }
    }
    return set;
  }, [data?.billing_lines]);

  if (isLoading) {
    return (
      <ExpandableContainer>
        <LoadingSpinner />
      </ExpandableContainer>
    );
  }

  if (error) {
    return (
      <ExpandableContainer>
        <LoadingErred
          message={translate('Failed to load resource data')}
          loadData={refetch}
        />
      </ExpandableContainer>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <ExpandableContainer>
      <div className="p-3">
        {/* Summary stats */}
        <div className="flex gap-3 mb-3 flex-wrap">
          <div>
            <span className="text-quaternary">
              {translate('Total resources:')}
            </span>{' '}
            <strong>{data.total_customer_resources}</strong>
          </div>
          <div>
            <span className="text-quaternary">
              {translate('With license ref (backend_id):')}
            </span>{' '}
            <strong>{data.resources_with_backend_id}</strong>
          </div>
          <div>
            <span className="text-quaternary">
              {translate('Consumption fetched:')}
            </span>{' '}
            <strong
              className={
                data.matched_resources > 0 ? 'text-success' : 'text-quaternary'
              }
            >
              {data.matched_resources}
            </strong>
          </div>
          <div>
            <span className="text-quaternary">
              {translate('Billing lines:')}
            </span>{' '}
            <strong>{data.billing_lines?.length || 0}</strong>
          </div>
        </div>

        {/* Explanation */}
        <AlertItem
          type="floating"
          variant="info"
          className="mb-3"
          title={translate('How linking works:')}
          body={translate(
            'Resource backend_id should contain the Arrow License Reference (e.g., XSP12345). This is used to fetch consumption data from Arrow API.',
          )}
        />

        {/* Consumption lines (resources with consumption data) */}
        {data.consumption_lines && data.consumption_lines.length > 0 && (
          <div className="mb-3">
            <h6 className="mb-1.5">
              {translate('Resources with Consumption Data')}
            </h6>
            <ConsumptionLinesTable
              lines={data.consumption_lines}
              billingLicenseRefs={billingLicenseRefs}
            />
          </div>
        )}

        {/* Billing lines (from Arrow) */}
        {data.billing_lines && data.billing_lines.length > 0 && (
          <div className="mb-3">
            <h6 className="mb-1.5">{translate('Arrow Billing Lines')}</h6>
            <p className="text-quaternary small mb-1.5">
              {translate(
                'These are the license references from Arrow billing export. Resources with matching backend_id will show consumption data.',
              )}
            </p>
            {/* About ten 44px rows under the header, as many as the list used
                to show before it was capped; the last one is cut in half so
                the box reads as scrollable. */}
            <div className="max-h-[460px] overflow-y-auto">
              <BillingLinesTable lines={data.billing_lines} />
            </div>
          </div>
        )}

        {/* Empty state */}
        {data.total_customer_resources === 0 && (
          <div className="text-center text-quaternary py-3">
            {translate('No resources found for this customer in Waldur.')}
          </div>
        )}

        {data.total_customer_resources > 0 &&
          data.resources_with_backend_id === 0 && (
            <div className="text-center text-quaternary py-3">
              <p className="mb-1.5">
                {translate('No resources have backend_id set.')}
              </p>
              <p className="small mb-0">
                {translate(
                  'Set the backend_id to the Arrow License Reference (e.g., XSP12345) to enable consumption tracking.',
                )}
              </p>
            </div>
          )}
      </div>
    </ExpandableContainer>
  );
};
