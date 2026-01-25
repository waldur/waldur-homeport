import { EChartsOption } from 'echarts';
import { DateTime } from 'luxon';
import { FC, useMemo } from 'react';
import { Card } from 'react-bootstrap';

import { EChart } from '@waldur/core/EChart';
import { translate } from '@waldur/i18n';

import { UserRegistrationTrend } from '../types';

interface RegistrationTrendChartProps {
  data: UserRegistrationTrend[];
}

/**
 * Format month string to display format
 */
function formatMonth(month: string): string {
  const date = DateTime.fromFormat(month, 'yyyy-MM');
  if (date.isValid) {
    return date.toFormat('MMM yyyy');
  }
  return month;
}

export const RegistrationTrendChart: FC<RegistrationTrendChartProps> = ({
  data,
}) => {
  // Sort by month ascending
  const sortedData = useMemo(
    () => [...data].sort((a, b) => a.month.localeCompare(b.month)),
    [data],
  );

  const months = useMemo(
    () => sortedData.map((item) => formatMonth(item.month)),
    [sortedData],
  );

  const values = useMemo(
    () => sortedData.map((item) => item.count),
    [sortedData],
  );

  const options = useMemo<EChartsOption>(
    () => ({
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const param = params[0];
          return `${param.name}: ${param.value.toLocaleString()} ${translate('registrations')}`;
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: months,
        axisLabel: {
          rotate: 45,
        },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: (value: number) => value.toLocaleString(),
        },
      },
      series: [
        {
          type: 'line',
          data: values,
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: {
            width: 3,
          },
          areaStyle: {
            opacity: 0.2,
          },
          emphasis: {
            focus: 'series',
          },
        },
      ],
    }),
    [months, values],
  );

  if (data.length === 0) {
    return (
      <Card className="h-100">
        <Card.Header>
          <Card.Title>{translate('Registration trend')}</Card.Title>
        </Card.Header>
        <Card.Body className="d-flex align-items-center justify-content-center text-muted">
          {translate('No data available')}
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="h-100">
      <Card.Header>
        <Card.Title>{translate('Registration trend')}</Card.Title>
      </Card.Header>
      <Card.Body>
        <EChart options={options} height="300px" />
      </Card.Body>
    </Card>
  );
};
