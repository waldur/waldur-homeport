import { useQuery } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { FC, useMemo, useState } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import {
  marketplaceStatsOrderStatsRetrieve,
  OrderStatsResponse,
} from 'waldur-js-client';

import { EChart } from '@waldur/core/EChart';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

import {
  ORDER_STATES,
  ORDER_TYPES,
  STATE_COLORS,
  TYPE_COLORS,
} from '../orders/types';
import { useReportBreadcrumbs } from '../ReportsBreadcrumbs';

import { ProviderFilter } from './ProviderFilter';

const dateRangeOptions = [
  { value: 7, label: translate('Last 7 days') },
  { value: 14, label: translate('Last 14 days') },
  { value: 30, label: translate('Last 30 days') },
  { value: 60, label: translate('Last 60 days') },
  { value: 90, label: translate('Last 90 days') },
];

const ProviderOrdersContent: FC<{ providerUuid: string; days: number }> = ({
  providerUuid,
  days,
}) => {
  const { startDate, endDate } = useMemo(() => {
    const end = DateTime.now().toISODate();
    const start = DateTime.now().minus({ days }).toISODate();
    return { startDate: start, endDate: end };
  }, [days]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['provider-orders', providerUuid, startDate, endDate],
    queryFn: async () => {
      const response = await marketplaceStatsOrderStatsRetrieve({
        query: {
          start: startDate,
          end: endDate,
          provider_uuid: providerUuid,
        },
      });
      return response.data as OrderStatsResponse;
    },
    enabled: !!providerUuid,
  });

  const trendChartOptions = useMemo(() => {
    if (!data?.daily) return null;

    const dates = data.daily.map((d) =>
      DateTime.fromISO(d.date).toFormat('MMM dd'),
    );
    const totals = data.daily.map((d) => d.total);

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: { rotate: 45 },
      },
      yAxis: {
        type: 'value',
        name: translate('Orders'),
        minInterval: 1,
      },
      series: [
        {
          name: translate('Orders'),
          type: 'bar',
          data: totals,
          itemStyle: { color: '#009ef7' },
        },
      ],
    };
  }, [data]);

  const stateChartOptions = useMemo(() => {
    if (!data?.by_state) return null;

    const chartData = Object.entries(data.by_state)
      .filter(([, value]) => (value as number) > 0)
      .map(([state, value]) => ({
        name: ORDER_STATES[state] || state,
        value,
        itemStyle: { color: STATE_COLORS[state] || '#7e8299' },
      }));

    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
      },
      legend: {
        orient: 'vertical',
        right: '5%',
        top: 'center',
      },
      series: [
        {
          name: translate('Orders by State'),
          type: 'pie',
          radius: ['40%', '70%'],
          data: chartData,
          itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
          label: { show: false },
          emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
        },
      ],
    };
  }, [data]);

  const typeChartOptions = useMemo(() => {
    if (!data?.by_type) return null;

    const types = Object.keys(ORDER_TYPES);
    const chartData = types.map((type) => ({
      value: (data.by_type as Record<string, number>)[type] || 0,
      itemStyle: { color: TYPE_COLORS[type] || '#7e8299' },
    }));

    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: types.map((type) => ORDER_TYPES[type] || type),
      },
      yAxis: { type: 'value', name: translate('Orders'), minInterval: 1 },
      series: [
        {
          name: translate('Orders'),
          type: 'bar',
          data: chartData,
          barWidth: '60%',
        },
      ],
    };
  }, [data]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <LoadingErred loadData={refetch} />;
  if (!data) return null;

  return (
    <>
      <Row className="g-4 mb-6">
        <Col xs={12} sm={6} lg={3}>
          <Card className="card-flush h-100">
            <Card.Body className="py-5">
              <div className="fs-2 fw-bold text-primary">
                {data.summary.total}
              </div>
              <div className="text-muted fs-7">{translate('Total orders')}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="card-flush h-100">
            <Card.Body className="py-5">
              <div className="fs-2 fw-bold text-warning">
                {data.summary.pending}
              </div>
              <div className="text-muted fs-7">{translate('Pending')}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="card-flush h-100">
            <Card.Body className="py-5">
              <div className="fs-2 fw-bold text-success">
                {data.summary.done}
              </div>
              <div className="text-muted fs-7">{translate('Completed')}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="card-flush h-100">
            <Card.Body className="py-5">
              <div className="fs-2 fw-bold text-danger">
                {data.summary.rejected + data.summary.canceled}
              </div>
              <div className="text-muted fs-7">
                {translate('Rejected/Canceled')}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mb-6">
        <Col xs={12} lg={8}>
          <Card>
            <Card.Header>
              <Card.Title>{translate('Order volume trend')}</Card.Title>
            </Card.Header>
            <Card.Body>
              {trendChartOptions && (
                <EChart options={trendChartOptions} height="300px" />
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} lg={4}>
          <Card>
            <Card.Header>
              <Card.Title>{translate('Orders by state')}</Card.Title>
            </Card.Header>
            <Card.Body>
              {stateChartOptions && (
                <EChart options={stateChartOptions} height="300px" />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col xs={12} lg={6}>
          <Card>
            <Card.Header>
              <Card.Title>{translate('Orders by type')}</Card.Title>
            </Card.Header>
            <Card.Body>
              {typeChartOptions && (
                <EChart options={typeChartOptions} height="300px" />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export const ProviderOrdersPage: FC = () => {
  useTitle(translate('Provider orders'));
  useReportBreadcrumbs({ category: 'provider', currentReport: 'orders' });

  const [days, setDays] = useState(30);
  const formValues = useSelector(getFormValues('ProviderReportingFilter')) as {
    provider?: { uuid: string };
  };
  const providerUuid = formValues?.provider?.uuid;

  return (
    <>
      <Card className="mb-6">
        <Card.Header>
          <Card.Title>{translate('Filters')}</Card.Title>
        </Card.Header>
        <Card.Body>
          <Row className="g-3">
            <Col xs={12} sm={6} md={4}>
              <ProviderFilter />
            </Col>
            <Col xs={12} sm={6} md={4}>
              <Select
                placeholder={translate('Date range')}
                value={dateRangeOptions.find((o) => o.value === days)}
                onChange={(option) => option && setDays(option.value)}
                options={dateRangeOptions}
                isClearable={false}
                className="metronic-select-container"
                classNamePrefix="metronic-select"
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {providerUuid ? (
        <ProviderOrdersContent providerUuid={providerUuid} days={days} />
      ) : (
        <Card>
          <Card.Body className="text-center text-muted py-10">
            {translate('Please select a provider to view order statistics')}
          </Card.Body>
        </Card>
      )}
    </>
  );
};
