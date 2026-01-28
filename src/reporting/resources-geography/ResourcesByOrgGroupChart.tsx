import { EChartsOption } from 'echarts';
import { FC, useMemo } from 'react';
import { Card } from 'react-bootstrap';
import { CountStats } from 'waldur-js-client';

import { EChart } from '@waldur/core/EChart';
import { translate } from '@waldur/i18n';

interface ResourcesByOrgGroupChartProps {
  data: CountStats[];
}

export const ResourcesByOrgGroupChart: FC<ResourcesByOrgGroupChartProps> = ({
  data,
}) => {
  // Sort by count descending and take top 10
  const chartData = useMemo(() => {
    const sorted = [...data].sort((a, b) => b.count - a.count);
    return sorted.slice(0, 10);
  }, [data]);

  const options = useMemo<EChartsOption>(
    () => ({
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
        type: 'value',
      },
      yAxis: {
        type: 'category',
        data: chartData.map((item) => item.name),
        inverse: true,
        axisLabel: {
          width: 120,
          overflow: 'truncate',
        },
      },
      series: [
        {
          type: 'bar',
          data: chartData.map((item) => item.count),
          itemStyle: {
            color: '#009ef7',
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
    [chartData],
  );

  if (data.length === 0) {
    return (
      <Card className="h-100">
        <Card.Header>
          <Card.Title>
            {translate('Resources by organization group')}
          </Card.Title>
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
        <Card.Title>{translate('Resources by organization group')}</Card.Title>
      </Card.Header>
      <Card.Body>
        <EChart options={options} height="300px" />
      </Card.Body>
    </Card>
  );
};
