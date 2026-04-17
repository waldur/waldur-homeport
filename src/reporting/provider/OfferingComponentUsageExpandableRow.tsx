import { useQuery } from '@tanstack/react-query';
import { uniqueId } from 'lodash-es';
import { DateTime } from 'luxon';
import { FC, useMemo, useState } from 'react';
import {
  Card,
  Col,
  Row,
  ToggleButton,
  ToggleButtonGroup,
} from 'react-bootstrap';

import { STALE_TIME } from '@waldur/core/constants';
import { EChart } from '@waldur/core/EChart';
import { formatUsageValue } from '@waldur/core/formatNumber';
import { Link } from '@waldur/core/Link';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { getOfferingTypes } from '@waldur/marketplace/common/registry';
import { getComponentUsageMonthlyList } from '@waldur/marketplace/offerings/api';
import { OfferingComponentUsage } from '@waldur/marketplace/offerings/types';
import { getLimitPeriods } from '@waldur/marketplace/offerings/update/components/ComponentLimitPeriodField';
import { Field } from '@waldur/resource/summary';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';

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
        .toFormat('yyyy-MM-dd'),
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
      getComponentUsageMonthlyList({
        query: {
          offering_uuid: row.offering_uuid,
          component_type: row.component_type,
          date_after,
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
        <Col sm={6} className="border-sm-start ps-md-9">
          <Card className="card-bordered">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center justify-content-between gap-2 text-nowrap flex-wrap mb-4">
                <ToggleButtonGroup
                  type="radio"
                  name={'period-' + uniqueId()}
                  value={period}
                  onChange={setPeriod}
                >
                  {[6, 12].map((m) => (
                    <ToggleButton
                      key={m}
                      id={'tbg-' + m + uniqueId()}
                      value={m}
                      variant="outline-secondary"
                      size="sm"
                      className="px-4"
                    >
                      {translate('{month} months', { month: m })}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
                {row.measured_unit && (
                  <span className="fs-7 text-muted">
                    {translate('Metric')}: {row.measured_unit}
                  </span>
                )}
              </div>
              <div className="d-flex min-h-70px">
                {isLoading ? (
                  <LoadingSpinner className="flex-grow-1" />
                ) : error ? (
                  <LoadingErred loadData={refetch} className="flex-grow-1" />
                ) : usageData.length ? (
                  <>
                    <div className="d-flex flex-column justify-content-between fs-7 text-nowrap pt-2 me-4">
                      <span>
                        {translate('Max usage')}:{' '}
                        {formatUsageValue(Math.max(...usageData))}
                      </span>
                      <span>
                        {translate('Last usage')}:{' '}
                        {formatUsageValue(usageData[usageData.length - 1])}
                      </span>
                      {limitData.length > 0 && (
                        <span className="text-muted">
                          {translate('Current limit')}:{' '}
                          {formatUsageValue(limitData[limitData.length - 1])}
                        </span>
                      )}
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
