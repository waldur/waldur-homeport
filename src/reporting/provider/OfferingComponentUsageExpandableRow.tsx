import { useQuery } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { FC, useMemo, useState } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { marketplaceComponentUsageMonthlyList } from 'waldur-js-client';

import { SegmentedControl } from 'waldur-ui';

import { STALE_TIME } from '@/core/constants';
import { EChart } from '@/core/EChart';
import { formatUsageValue } from '@/core/formatNumber';
import { Link } from '@/core/Link';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { getOfferingTypes } from '@/marketplace/common/registry';
import { OfferingComponentUsage } from '@/marketplace/offerings/types';
import { getLimitPeriods } from '@/marketplace/offerings/update/components/ComponentLimitPeriodField';
import { Field } from '@/resource/summary';
import { ExpandableContainer } from '@/table/ExpandableContainer';

import { getUsageLineChartOptions } from '../utils';

interface OfferingComponentUsageExpandableRowProps {
  row: OfferingComponentUsage;
}

export const OfferingComponentUsageExpandableRow: FC<
  OfferingComponentUsageExpandableRowProps
> = ({ row }) => {
  const [period, setPeriod] = useState(12);

  const date_after = useMemo(
    () =>
      DateTime.now()
        .startOf('month')
        .minus({ months: period })
        .toFormat('yyyy-MM'),
    [period],
  );

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [
      'offeringComponentUsageHistory',
      row.offering_uuid,
      row.component_type,
      period,
    ],
    queryFn: () =>
      marketplaceComponentUsageMonthlyList({
        query: {
          offering_uuid: row.offering_uuid,
          component_type: row.component_type,
          start: date_after,
          field: ['total_consumed', 'total_allocated', 'billing_period'],
        },
      }).then((response) => response.data),
    staleTime: STALE_TIME,
  });

  const chartOptions = useMemo(() => {
    const labels = [];
    const usageValues = [];
    const limitValues = [];

    for (let i = period - 1; i >= 0; i--) {
      const date = DateTime.now().minus({ months: i });
      const label = date.toFormat('yyyy-MM');
      labels.push(label);

      const matchingData = data?.find(
        (item) =>
          DateTime.fromISO(item.billing_period).toFormat('yyyy-MM') === label,
      );

      usageValues.push(matchingData ? Number(matchingData.total_consumed) : 0);
      limitValues.push(matchingData ? Number(matchingData.total_allocated) : 0);
    }

    return getUsageLineChartOptions(labels, usageValues, limitValues);
  }, [data, period]);

  const usageData = chartOptions.series?.[0]?.data || [];
  const limitData = chartOptions.series?.[1]?.data || [];

  const limitPeriodLabel = useMemo(
    () =>
      getLimitPeriods().find((p) => p.value === row.limit_period)?.label ||
      row.limit_period,
    [row.limit_period],
  );

  const integrationTypeLabel = useMemo(
    () =>
      getOfferingTypes().find((t) => t.value === row.offering_type)?.label ||
      row.offering_type,
    [row.offering_type],
  );

  return (
    <ExpandableContainer>
      <Row className="gy-4">
        <Col sm={6}>
          <Field
            label={translate('Service provider')}
            value={row.service_provider_name}
          />
          <Field
            label={translate('Offering')}
            value={
              <Link
                state="admin-marketplace-offering-details"
                params={{ offering_uuid: row.offering_uuid }}
                label={row.offering_name}
              />
            }
          />
          <Field label={translate('Component')} value={row.component_name} />
          <Field label={translate('Limit period')} value={limitPeriodLabel} />
          <Field label={translate('Category')} value={row.category_title} />
          <Field
            label={translate('Integration type')}
            value={integrationTypeLabel}
          />
        </Col>
        <Col sm={6} className="border-sm-start md:ps-7.5">
          <Card className="card-bordered">
            <Card.Body className="p-3">
              <div className="flex items-center justify-between gap-1.5 whitespace-nowrap flex-wrap mb-3">
                <SegmentedControl<number>
                  aria-label={translate('Time period')}
                  size="sm"
                  itemClassName="px-3"
                  options={[6, 12].map((m) => ({
                    value: m,
                    label: translate('{month} months', { month: m }),
                  }))}
                  value={period}
                  onValueChange={setPeriod}
                />
                {row.measured_unit && (
                  <span className="text-xs text-quaternary">
                    {translate('Metric')}: {row.measured_unit}
                  </span>
                )}
              </div>
              <div className="flex min-h-[70px]">
                {isLoading ? (
                  <LoadingSpinner className="grow" />
                ) : error ? (
                  <LoadingErred loadData={refetch} className="grow" />
                ) : usageData.length ? (
                  <>
                    <div className="flex flex-col justify-between text-xs whitespace-nowrap pt-1.5 me-3">
                      <span>
                        {translate('Max usage')}:{' '}
                        {formatUsageValue(Math.max(...usageData))}
                      </span>
                      <span>
                        {translate('Last usage')}:{' '}
                        {formatUsageValue(usageData[usageData.length - 1])}
                      </span>
                      {limitData.length > 0 && (
                        <span className="text-quaternary">
                          {translate('Current limit')}:{' '}
                          {formatUsageValue(limitData[limitData.length - 1])}
                        </span>
                      )}
                    </div>
                    <EChart options={chartOptions} height="70px" />
                  </>
                ) : (
                  <p className="self-center text-center mb-0 w-full">
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
