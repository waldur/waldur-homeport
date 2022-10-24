import { Card, Col, Row } from 'react-bootstrap';

import { EChart } from '@waldur/core/EChart';
import { translate } from '@waldur/i18n';

const ResourceChart = ({ title, color }) => {
  let base = +new Date(2022, 9, 24);
  const oneHour = 3600 * 1000;

  const data = [[base, Math.random() * 100]];

  for (let i = 1; i < 20; i++) {
    const now = new Date((base += oneHour));
    data.push([+now, Math.round((Math.random() - 0.5) * 20 + data[i - 1][1])]);
  }

  const chartOptions = {
    tooltip: {
      trigger: 'axis',
      position: function (pt) {
        return [pt[0], '10%'];
      },
    },
    title: {
      left: 'center',
      text: title,
    },
    toolbox: {
      feature: {
        dataZoom: {
          yAxisIndex: 'none',
        },
        saveAsImage: {},
      },
    },
    xAxis: {
      type: 'time',
      boundaryGap: false,
    },
    yAxis: {
      type: 'value',
      boundaryGap: [0, '100%'],
    },
    series: [
      {
        type: 'line',
        symbol: 'none',
        step: 'start',
        lineStyle: {
          color,
        },
        areaStyle: {
          color,
          opacity: 0.8,
        },
        data,
      },
    ],
  };

  return <EChart options={chartOptions} height="350px" />;
};

export const MonitoringCharts = () => (
  <div className="mb-10">
    <Card>
      <Card.Header>
        <Card.Title>
          <h3>{translate('Monitoring')}</h3>
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <Row>
          <Col>
            <ResourceChart
              title={translate('CPU')}
              color="rgb(128, 255, 165)"
            />
          </Col>
          <Col>
            <ResourceChart
              title={translate('Memory')}
              color="rgb(0, 221, 255)"
            />
          </Col>
        </Row>
        <Row>
          <Col>
            <ResourceChart
              title={translate('Disk usage')}
              color="rgb(55, 162, 255)"
            />
          </Col>
          <Col>
            <ResourceChart
              title={translate('Bandwidth')}
              color="rgb(255, 0, 135)"
            />
          </Col>
        </Row>
      </Card.Body>
    </Card>
  </div>
);
