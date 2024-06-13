import { FunctionComponent } from 'react';
import { Col, ProgressBar, Row } from 'react-bootstrap';

import { EChart } from '@waldur/core/EChart';
import { translate } from '@waldur/i18n';

interface StatisticItem {
  label: string;
  type: 'progress' | 'chart';
  max?: number;
  value?: number;
  unit?: string;
  data?: Array<{ date: string; value: number; unit?: string }>;
}

const dummyData: StatisticItem[] = [
  {
    label: translate('Current revenue'),
    type: 'chart',
    unit: '€',
    data: [
      { date: '2023-10-01', value: 40 },
      { date: '2023-10-02', value: 600.8 },
      { date: '2023-10-03', value: -240.7 },
      { date: '2023-10-04', value: 400 },
      { date: '2023-10-05', value: 534.434 },
    ],
  },
  {
    label: translate('Estimated revenue'),
    type: 'chart',
    unit: '€',
    data: [
      { date: '2023-10-01', value: -40.8 },
      { date: '2023-10-02', value: 500.8 },
      { date: '2023-10-03', value: -120.5 },
      { date: '2023-10-04', value: 400 },
      { date: '2023-10-05', value: 534.434 },
    ],
  },
  {
    label: translate('Total resources'),
    type: 'chart',
    data: [
      { date: '2023-10-01', value: 50 },
      { date: '2023-10-02', value: 80 },
      { date: '2023-10-03', value: 90 },
      { date: '2023-10-04', value: 100 },
      { date: '2023-10-05', value: 169 },
    ],
  },
  {
    label: translate('Expiring resources'),
    type: 'chart',
    data: [
      { date: '2023-10-01', value: 1 },
      { date: '2023-10-02', value: 2 },
      { date: '2023-10-03', value: 1 },
      { date: '2023-10-04', value: 3 },
      { date: '2023-10-05', value: 4 },
    ],
  },
  {
    label: 'Commited cores',
    type: 'progress',
    max: 3534,
    value: 600,
  },
  {
    label: 'Commited memory',
    type: 'progress',
    max: 12324,
    value: 10430,
  },
  {
    label: 'Commited networks',
    type: 'progress',
    max: 256,
    value: 20,
  },
];

const OfferingStatisticChart = ({ data }: { data: StatisticItem['data'] }) => {
  const chartOptions = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    xAxis: {
      type: 'category',
      data: data.map((d) => d.date),
      show: false,
    },
    yAxis: {
      type: 'value',
      show: false,
    },
    series: [
      {
        data: data.map((d) => d.value),
        type: 'bar',
        itemStyle: {
          color: function (param) {
            return param.dataIndex === data.length - 1 ? '#7e8299' : '#e4e6ef';
          },
        },
      },
    ],
  };

  return <EChart options={chartOptions} height="50px" />;
};

const StatisticChartItem = ({ item }: { item: StatisticItem }) => {
  return (
    <div className="statistic-item">
      <OfferingStatisticChart data={item.data} />
      <h5 className="mt-4 mb-0">
        {[item.unit, item.data[item.data.length - 1].value]
          .filter(Boolean)
          .join(' ')}
      </h5>
      <span className="fw-bolder text-muted">{item.label}</span>
    </div>
  );
};

const StatisticProgressItem = ({ item }: { item: StatisticItem }) => {
  return (
    <div className="statistic-item">
      <div className="h-50px d-flex flex-column justify-content-end">
        <ProgressBar
          variant="gray-600"
          now={item.value}
          max={item.max}
          className="rounded-0"
        />
      </div>
      <h5 className="mt-4 mb-0">
        {item.value}/{item.max}
      </h5>
      <span className="fw-bolder text-muted">{item.label}</span>
    </div>
  );
};

export const OfferingDetailsStatistics: FunctionComponent = () => {
  return (
    <div className="offering-statistics bg-body">
      <div className="container-fluid">
        <Row className="pt-14 pb-6">
          {dummyData.map((item, i) => (
            <Col xs={6} sm={3} xl key={i}>
              {item.type === 'chart' ? (
                <StatisticChartItem item={item} />
              ) : (
                <StatisticProgressItem item={item} />
              )}
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};
