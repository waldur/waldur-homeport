import { EChartsOption } from 'echarts';
import { FC, useMemo } from 'react';
import { Card } from 'react-bootstrap';
import { OfferingCost } from 'waldur-js-client';

import { EChart } from '@waldur/core/EChart';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';

interface OfferingCostsChartProps {
  data: OfferingCost[];
}

export const OfferingCostsChart: FC<OfferingCostsChartProps> = ({ data }) => {
  // Sort by cost descending and take top 10
  const chartData = useMemo(() => {
    const sorted = [...data].sort((a, b) => b.cost - a.cost);
    return sorted.slice(0, 10);
  }, [data]);

  const total = useMemo(
    () => data.reduce((sum, item) => sum + item.cost, 0),
    [data],
  );

  const options = useMemo<EChartsOption>(
    () => ({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const param = params[0];
          const percent =
            total > 0 ? ((param.value / total) * 100).toFixed(1) : 0;
          return `${param.name}: ${defaultCurrency(param.value)} (${percent}%)`;
        },
      },
      grid: {
        left: '3%',
        right: '15%',
        bottom: '3%',
        top: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        axisLabel: {
          formatter: (value: number) => defaultCurrency(value) ?? '',
        },
      },
      yAxis: {
        type: 'category',
        data: chartData.map((item) => item.offering_name),
        inverse: true,
        axisLabel: {
          width: 150,
          overflow: 'truncate',
        },
      },
      series: [
        {
          type: 'bar',
          data: chartData.map((item) => item.cost),
          itemStyle: {
            color: '#009ef7',
            borderRadius: [0, 4, 4, 0],
          },
          label: {
            show: true,
            position: 'right',
            formatter: (params: any) => defaultCurrency(params.value) ?? '',
          },
        },
      ],
    }),
    [chartData, total],
  );

  if (data.length === 0) {
    return (
      <Card className="h-100">
        <Card.Header>
          <Card.Title>{translate('Top offerings by cost')}</Card.Title>
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
        <Card.Title>{translate('Top offerings by cost')}</Card.Title>
      </Card.Header>
      <Card.Body>
        <EChart options={options} height="400px" />
      </Card.Body>
    </Card>
  );
};
