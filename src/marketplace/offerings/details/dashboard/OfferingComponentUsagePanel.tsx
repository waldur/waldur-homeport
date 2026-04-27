import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { Offering } from 'waldur-js-client';

import { UI_STALE_TIME } from '@/core/constants';
import { formatUsageValue } from '@/core/formatNumber';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';

import { getComponentUsageMonthlyList } from '../../api';

interface OfferingComponentUsagePanelProps {
  offering: Offering;
}

export const OfferingComponentUsagePanel: FC<
  OfferingComponentUsagePanelProps
> = ({ offering }) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['offeringUsageStats', offering.uuid],
    queryFn: () =>
      getComponentUsageMonthlyList({
        query: {
          offering_uuid: offering.uuid,
          field: [
            'component_name',
            'total_consumed',
            'total_allocated',
            'measured_unit',
            'usage_percent',
          ],
        },
      }).then((response) => response.data),
    staleTime: UI_STALE_TIME,
  });

  return (
    <FormTable.Card
      title={translate('Component usage')}
      className="card-bordered mb-5"
      headerClassName="min-h-60px"
    >
      <FormTable detailsMode className="gy-5">
        {isLoading || error ? (
          <tr>
            <td colSpan={3}>
              {isLoading ? (
                <LoadingSpinner />
              ) : error ? (
                <LoadingErred loadData={refetch} />
              ) : null}
            </td>
          </tr>
        ) : (
          <>
            {data?.length > 0 ? (
              data
                .sort((a, b) => (b.usage_percent || 0) - (a.usage_percent || 0))
                .map((row) => {
                  const usage =
                    row.usage_percent !== undefined
                      ? Number(row.usage_percent)
                      : 0;
                  return (
                    <FormTable.Item
                      key={row.component_name}
                      label={row.component_name}
                      value={
                        <div
                          className="d-flex flex-column gap-1"
                          style={{ minWidth: 150 }}
                        >
                          <div className="d-flex justify-content-between fs-7 text-muted">
                            <span>
                              {formatUsageValue(row.total_consumed, true)} /{' '}
                              {formatUsageValue(row.total_allocated, true)}{' '}
                              {row.measured_unit}
                            </span>

                            <span className="fw-bold text-dark">
                              {usage.toFixed(1)}%
                            </span>
                          </div>
                          <div className="progress h-6px w-100">
                            <div
                              className={`progress-bar bg-${
                                usage < 50
                                  ? 'primary'
                                  : usage < 80
                                    ? 'warning'
                                    : 'danger'
                              }`}
                              role="progressbar"
                              style={{ width: `${Math.min(usage, 100)}%` }}
                            />
                          </div>
                        </div>
                      }
                    />
                  );
                })
            ) : (
              <tr>
                <td colSpan={2} className="text-center text-muted py-5">
                  {translate('No usage data available.')}
                </td>
              </tr>
            )}
          </>
        )}
      </FormTable>
    </FormTable.Card>
  );
};
