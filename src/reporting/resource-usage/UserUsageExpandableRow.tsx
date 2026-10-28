import { useQuery } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { useEffect, useMemo, useState } from 'react';
import {
  ComponentUsage,
  ComponentUserUsage,
  marketplaceComponentUsagesList,
  marketplaceComponentUserUsagesList,
  marketplaceResourcesRetrieve,
} from 'waldur-js-client';

import { SegmentedControl, useBreakpointDown } from 'waldur-ui';

import { getAllPages, MAX_PAGE_SIZE } from '@/core/api';
import { UI_STALE_TIME } from '@/core/constants';
import { EChart } from '@/core/EChart';
import { formatUsageValue } from '@/core/formatNumber';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { getUsageHistoryPeriodOptions } from '@/marketplace/resources/usage/utils';
import { Field } from '@/resource/summary';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import { renderFieldOrDash } from '@/table/utils';

import { getUsageLineChartOptions } from '../utils';

export const UsageExpandableRow = ({
  row,
  type,
}: {
  row: ComponentUsage | ComponentUserUsage;
  type: 'resource-usage' | 'user-usage';
}) => {
  const componentType =
    type === 'resource-usage' ? row['type'] : row['component_type'];

  const {
    data: resource,
    refetch: refetchResource,
    isLoading: isLoadingResource,
    error: errorResource,
  } = useQuery({
    queryKey: ['resource-created-at', row.resource_uuid],
    queryFn: () =>
      marketplaceResourcesRetrieve({
        path: { uuid: row.resource_uuid },
        query: { field: ['created'] },
      }).then((r) => r.data),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  const isSmallScr = useBreakpointDown('lg');

  const periodOptions = useMemo(() => {
    if (!resource?.created) return [{ value: 6, label: translate('6 months') }];
    const options = getUsageHistoryPeriodOptions(resource.created, isSmallScr);
    return options.slice(0, options.length - 1); // Remove "From creation" option but keep longer periods
  }, [resource, isSmallScr]);

  const [period, setPeriod] = useState<number>(() => {
    // Will be updated by useEffect when periodOptions are available
    return 6; // Default fallback
  });

  // Update period when periodOptions become available
  useEffect(() => {
    if (
      periodOptions.length > 0 &&
      !periodOptions.find((opt) => opt.value === period)
    ) {
      setPeriod(periodOptions[0].value);
    }
  }, [periodOptions, period]);

  const date_after = period
    ? DateTime.now()
        .startOf('month')
        .minus({ months: period })
        .toFormat('yyyy-MM-dd')
    : undefined;

  const { data, refetch, isLoading, error } = useQuery({
    queryKey: ['usage-data', type, row.resource_uuid, componentType, period],
    queryFn: () =>
      period
        ? type === 'resource-usage'
          ? getAllPages((page) =>
              marketplaceComponentUsagesList({
                query: {
                  page,
                  page_size: MAX_PAGE_SIZE,
                  resource_uuid: row.resource_uuid,
                  date_after,
                  type: componentType,
                  field: ['usage', 'billing_period'],
                },
              }),
            )
          : getAllPages((page) =>
              marketplaceComponentUserUsagesList({
                query: {
                  page,
                  page_size: MAX_PAGE_SIZE,
                  resource_uuid: row.resource_uuid,
                  date_after,
                  type: componentType,
                  field: ['usage', 'billing_period', 'username'],
                },
              }),
            )
        : [],
    refetchOnWindowFocus: false,
    staleTime: UI_STALE_TIME,
  });

  const chartOptions = useMemo(() => {
    let _data = data || [];
    if (type === 'user-usage') {
      _data = _data.filter((item) => item['username'] === row['username']);
    }

    // Generate complete timeline of periods for the selected period
    const periods = [];
    const labels = [];
    const values = [];

    for (let i = period - 1; i >= 0; i--) {
      const periodDate = DateTime.now().minus({ months: i });
      const periodLabel = periodDate.toFormat('yyyy-MM');
      periods.push(periodDate);
      labels.push(periodLabel);

      // Find matching usage data for this period
      const matchingUsage = _data.find((item) => {
        const itemPeriod = DateTime.fromISO(item.billing_period).toFormat(
          'yyyy-MM',
        );
        return itemPeriod === periodLabel;
      });

      values.push(matchingUsage ? Number(matchingUsage.usage) : 0);
    }

    return getUsageLineChartOptions(labels, values);
  }, [data, row, period]);

  const chartData = chartOptions.series?.[0]?.data || [];

  return (
    <ExpandableContainer>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3">
        <div>
          <Field label={translate('Resource')} value={row.resource_uuid} />
          <Field
            label={translate('Comment')}
            value={renderFieldOrDash(row.description)}
          />
        </div>
        <div className="border-sm-start md:ps-7.5">
          <div className="card card-bordered">
            <div className="card-body p-3">
              <div className="flex items-center justify-between gap-1.5 whitespace-nowrap flex-wrap">
                <div>
                  {periodOptions.length > 1 && (
                    <SegmentedControl<number>
                      aria-label={translate('Time period')}
                      size="sm"
                      itemClassName="px-3"
                      options={periodOptions}
                      value={period}
                      onValueChange={setPeriod}
                    />
                  )}
                </div>
                {row.measured_unit && (
                  <span>
                    {translate('Metric')}
                    {': '}
                    {row.measured_unit}
                  </span>
                )}
              </div>
              <div className="flex min-h-[70px]">
                {isLoading || isLoadingResource ? (
                  <LoadingSpinner className="grow" />
                ) : error || errorResource ? (
                  <LoadingErred
                    loadData={() => (error ? refetch() : refetchResource())}
                    className="grow"
                  />
                ) : chartData.length ? (
                  <>
                    <div className="flex flex-col justify-between text-xs whitespace-nowrap pt-1.5">
                      <span>
                        {translate('Max')}
                        {': '}
                        {formatUsageValue(Math.max(...chartData))}
                      </span>
                      <span>
                        {translate('Last')}
                        {': '}
                        {formatUsageValue(chartData[chartData.length - 1])}
                      </span>
                    </div>
                    <EChart options={chartOptions} height="70px" />
                  </>
                ) : (
                  <p className="self-center text-center mb-0 w-full">
                    {translate('There are no statistics.')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ExpandableContainer>
  );
};
