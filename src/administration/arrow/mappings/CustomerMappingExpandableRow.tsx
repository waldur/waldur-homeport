import { FC, useMemo } from 'react';
import { Table } from 'react-bootstrap';
import type { ArrowCustomerMapping } from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import { ExpandableContainer } from '@/table/ExpandableContainer';

import { useFetchCustomerArrowData } from '../api';

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
      <div className="p-4">
        {/* Summary stats */}
        <div className="d-flex gap-4 mb-4 flex-wrap">
          <div>
            <span className="text-muted">{translate('Total resources:')}</span>{' '}
            <strong>{data.total_customer_resources}</strong>
          </div>
          <div>
            <span className="text-muted">
              {translate('With license ref (backend_id):')}
            </span>{' '}
            <strong>{data.resources_with_backend_id}</strong>
          </div>
          <div>
            <span className="text-muted">
              {translate('Consumption fetched:')}
            </span>{' '}
            <strong
              className={
                data.matched_resources > 0 ? 'text-success' : 'text-muted'
              }
            >
              {data.matched_resources}
            </strong>
          </div>
          <div>
            <span className="text-muted">{translate('Billing lines:')}</span>{' '}
            <strong>{data.billing_lines?.length || 0}</strong>
          </div>
        </div>

        {/* Explanation */}
        <div className="alert alert-light mb-4">
          <strong>{translate('How linking works:')}</strong>{' '}
          {translate(
            'Resource backend_id should contain the Arrow License Reference (e.g., XSP12345). This is used to fetch consumption data from Arrow API.',
          )}
        </div>

        {/* Consumption lines (resources with consumption data) */}
        {data.consumption_lines && data.consumption_lines.length > 0 && (
          <div className="mb-4">
            <h6 className="mb-2">
              {translate('Resources with Consumption Data')}
            </h6>
            <Table size="sm" bordered className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>{translate('Resource')}</th>
                  <th>{translate('License Reference (backend_id)')}</th>
                  <th>{translate('In Billing')}</th>
                  <th className="text-end">{translate('Consumption')}</th>
                </tr>
              </thead>
              <tbody>
                {data.consumption_lines.map((line, idx) => {
                  const inBilling = billingLicenseRefs.has(
                    line.license_reference,
                  );
                  return (
                    <tr key={idx}>
                      <td>{line.resource_name || DASH_ESCAPE_CODE}</td>
                      <td>
                        <span className="small">{line.license_reference}</span>
                      </td>
                      <td>
                        {inBilling ? (
                          <Badge variant="success" outline>
                            {translate('Yes')}
                          </Badge>
                        ) : (
                          <Badge variant="default" outline>
                            {translate('No')}
                          </Badge>
                        )}
                      </td>
                      <td className="text-end">
                        {line.sell_price != null ? (
                          `€${Number(line.sell_price).toFixed(2)}`
                        ) : line.error ? (
                          <span className="text-danger" title={line.error}>
                            {translate('Error')}
                          </span>
                        ) : (
                          DASH_ESCAPE_CODE
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}

        {/* Billing lines (from Arrow) */}
        {data.billing_lines && data.billing_lines.length > 0 && (
          <div className="mb-4">
            <h6 className="mb-2">{translate('Arrow Billing Lines')}</h6>
            <p className="text-muted small mb-2">
              {translate(
                'These are the license references from Arrow billing export. Resources with matching backend_id will show consumption data.',
              )}
            </p>
            <Table size="sm" bordered className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>{translate('Vendor')}</th>
                  <th>{translate('License Reference')}</th>
                  <th>{translate('SKU')}</th>
                  <th className="text-end">{translate('Sell')}</th>
                </tr>
              </thead>
              <tbody>
                {data.billing_lines.slice(0, 10).map((line, idx) => (
                  <tr key={idx}>
                    <td>{line.vendor_name || DASH_ESCAPE_CODE}</td>
                    <td>
                      <span className="small">
                        {line.license_reference || DASH_ESCAPE_CODE}
                      </span>
                    </td>
                    <td>{line.offer_sku || DASH_ESCAPE_CODE}</td>
                    <td className="text-end">
                      {line.sell_price != null
                        ? `€${Number(line.sell_price).toFixed(2)}`
                        : DASH_ESCAPE_CODE}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {data.billing_lines.length > 10 && (
              <div className="text-muted small mt-1">
                {translate('Showing 10 of {total} billing lines', {
                  total: data.billing_lines.length,
                })}
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {data.total_customer_resources === 0 && (
          <div className="text-center text-muted py-4">
            {translate('No resources found for this customer in Waldur.')}
          </div>
        )}

        {data.total_customer_resources > 0 &&
          data.resources_with_backend_id === 0 && (
            <div className="text-center text-muted py-4">
              <p className="mb-2">
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
