import { useQuery } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { FC, useMemo } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import {
  marketplaceServiceProvidersRevenueList,
  ServiceProviderRevenues,
} from 'waldur-js-client';

import { EChart } from '@waldur/core/EChart';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { NoResult } from '@waldur/navigation/header/search/NoResult';
import { useTitle } from '@waldur/navigation/title';

import { useReportBreadcrumbs } from '../ReportsBreadcrumbs';

import { ProviderFilter } from './ProviderFilter';

const ProviderRevenueContent: FC<{ providerUuid: string }> = ({
  providerUuid,
}) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['provider-revenue', providerUuid],
    queryFn: async () => {
      const response = await marketplaceServiceProvidersRevenueList({
        path: { uuid: providerUuid },
      });
      return response.data as ServiceProviderRevenues[];
    },
    enabled: !!providerUuid,
  });

  const chartOptions = useMemo(() => {
    if (!data || data.length === 0) return null;

    const months = data.map((d) =>
      DateTime.fromObject({ year: d.year, month: d.month }).toFormat(
        'MMM yyyy',
      ),
    );
    const values = data.map((d) => d.total || 0);

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params) => {
          const value = params[0].value;
          return `${params[0].name}: ${defaultCurrency(value)}`;
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: months,
        axisLabel: { rotate: 45 },
      },
      yAxis: {
        type: 'value',
        name: translate('Revenue'),
        axisLabel: {
          formatter: (value) => defaultCurrency(value),
        },
      },
      series: [
        {
          name: translate('Revenue'),
          type: 'bar',
          data: values,
          itemStyle: { color: '#50cd89' },
        },
      ],
    };
  }, [data]);

  const totalRevenue = useMemo(() => {
    if (!data) return 0;
    return data.reduce((sum, d) => sum + (d.total || 0), 0);
  }, [data]);

  const avgMonthlyRevenue = useMemo(() => {
    if (!data || data.length === 0) return 0;
    return totalRevenue / data.length;
  }, [data, totalRevenue]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <LoadingErred loadData={refetch} />;
  if (!data || data.length === 0) {
    return (
      <Card>
        <Card.Body className="text-center text-muted py-10">
          {translate('No revenue data available for this provider')}
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      <Row className="g-4 mb-6">
        <Col xs={12} sm={6} lg={3}>
          <Card className="card-flush h-100">
            <Card.Body className="py-5">
              <div className="fs-2 fw-bold text-success">
                {defaultCurrency(totalRevenue)}
              </div>
              <div className="text-muted fs-7">
                {translate('Total revenue (12 months)')}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="card-flush h-100">
            <Card.Body className="py-5">
              <div className="fs-2 fw-bold text-primary">
                {defaultCurrency(avgMonthlyRevenue)}
              </div>
              <div className="text-muted fs-7">
                {translate('Average monthly')}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card>
        <Card.Header>
          <Card.Title>{translate('Monthly revenue trend')}</Card.Title>
        </Card.Header>
        <Card.Body>
          {chartOptions && <EChart options={chartOptions} height="400px" />}
        </Card.Body>
      </Card>
    </>
  );
};

export const ProviderRevenuePage: FC = () => {
  useTitle(translate('Provider revenue'));
  useReportBreadcrumbs({ category: 'provider', currentReport: 'revenue' });

  const formValues = useSelector(getFormValues('ProviderReportingFilter')) as {
    provider?: { uuid: string };
  };
  const providerUuid = formValues?.provider?.uuid;

  return (
    <>
      <div className="d-flex flex-wrap gap-6 mb-6">
        <FormGroup
          label={translate('Provider')}
          className="flex-grow-1 mw-300px"
        >
          <ProviderFilter />
        </FormGroup>
      </div>

      {providerUuid ? (
        <ProviderRevenueContent providerUuid={providerUuid} />
      ) : (
        <NoResult
          title={translate('Select a provider')}
          message={translate(
            'Choose a provider from the dropdown above to view revenue data.',
          )}
        />
      )}
    </>
  );
};
