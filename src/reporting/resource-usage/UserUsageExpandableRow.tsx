import { useQuery } from '@tanstack/react-query';
import { uniqueId } from 'lodash-es';
import { DateTime } from 'luxon';
import { useEffect, useMemo, useState } from 'react';
import {
  Card,
  Col,
  Row,
  ToggleButton,
  ToggleButtonGroup,
} from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';
import {
  ComponentUsage,
  ComponentUserUsage,
  marketplaceComponentUsagesList,
  marketplaceComponentUserUsagesList,
  marketplaceResourcesRetrieve,
} from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@/core/api';
import { GRID_BREAKPOINTS, UI_STALE_TIME } from '@/core/constants';
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

  const isSmallScr = useMediaQuery({ maxWidth: GRID_BREAKPOINTS.lg });

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
      <Row className="gy-4">
        <Col sm={6}>
          <Field label={translate('Resource')} value={row.resource_uuid} />
          <Field
            label={translate('Comment')}
            value={renderFieldOrDash(row.description)}
          />
        </Col>
        <Col sm={6} className="border-sm-start ps-md-9">
          <Card className="card-bordered">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center justify-content-between gap-2 text-nowrap flex-wrap">
                <div>
                  {periodOptions.length > 1 && (
                    <ToggleButtonGroup
                      type="radio"
                      name={'period' + row.resource_uuid + componentType}
                      value={period}
                      defaultValue={period}
                      onChange={setPeriod}
                    >
                      {periodOptions.map((option) => (
                        <ToggleButton
                          key={option.value}
                          id={'tbg-' + option.value + uniqueId()}
                          value={option.value}
                          variant="outline-secondary"
                          size="sm"
                          className="px-4"
                        >
                          {option.label}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
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
              <div className="d-flex min-h-70px">
                {isLoading || isLoadingResource ? (
                  <LoadingSpinner className="flex-grow-1" />
                ) : error || errorResource ? (
                  <LoadingErred
                    loadData={() => (error ? refetch() : refetchResource())}
                    className="flex-grow-1"
                  />
                ) : chartData.length ? (
                  <>
                    <div className="d-flex flex-column justify-content-between fs-7 text-nowrap pt-2">
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
                  <p className="align-self-center text-center mb-0 w-100">
                    {translate('There are no statistics.')}
                  </p>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </ExpandableContainer>
  );
};
