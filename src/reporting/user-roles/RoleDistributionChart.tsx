import { EChartsOption } from 'echarts';
import { FC, useMemo } from 'react';
import { Card } from 'react-bootstrap';
import { CustomerMemberCount } from 'waldur-js-client';

import { EChart } from '@waldur/core/EChart';
import { translate } from '@waldur/i18n';

interface RoleDistributionChartProps {
  data: CustomerMemberCount[];
}

export const RoleDistributionChart: FC<RoleDistributionChartProps> = ({
  data,
}) => {
  // Sort by member count descending and take top 15
  const chartData = useMemo(() => {
    const sorted = [...data].sort((a, b) => b.count - a.count);
    return sorted.slice(0, 15);
  }, [data]);

  const total = useMemo(
    () => data.reduce((sum, item) => sum + item.count, 0),
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
          return `${param.name}: ${param.value.toLocaleString()} (${percent}%)`;
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
      },
      yAxis: {
        type: 'category',
        data: chartData.map((item) => item.abbreviation || item.name),
        inverse: true,
        axisLabel: {
          width: 150,
          overflow: 'truncate',
        },
      },
      series: [
        {
          type: 'bar',
          data: chartData.map((item) => ({
            value: item.count,
            itemStyle: {
              color: item.has_resources ? '#50cd89' : '#a1a5b7',
            },
          })),
          itemStyle: {
            borderRadius: [0, 4, 4, 0],
          },
          label: {
            show: true,
            position: 'right',
            formatter: (params: any) => params.value.toLocaleString(),
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
          <Card.Title>{translate('Members by organization')}</Card.Title>
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
        <Card.Title>{translate('Members by organization')}</Card.Title>
        <div className="card-toolbar">
          <span className="text-muted fs-7">
            <span
              className="bullet bullet-dot me-2"
              style={{ backgroundColor: '#50cd89' }}
            />
            {translate('With resources')}
            <span
              className="bullet bullet-dot ms-4 me-2"
              style={{ backgroundColor: '#a1a5b7' }}
            />
            {translate('Without resources')}
          </span>
        </div>
      </Card.Header>
      <Card.Body>
        <EChart options={options} height="500px" />
      </Card.Body>
    </Card>
  );
};
