import { FC, useMemo, useState } from 'react';
import { Col, Nav, Row, Stack, Tab } from 'react-bootstrap';
import { RancherCluster } from 'waldur-js-client';

import { translate } from '@waldur/i18n';

import { NetworkStatisticsCard } from './NetworkStatisticsCard';
import { PieChart } from './PieChart';
import { StatisticsCard } from './StatisticsCard';

const StatisticPieChartItem = ({ title, unit, total, value, color }) => {
  return (
    <Stack direction="horizontal" gap={5}>
      <PieChart
        data={[
          {
            name: title,
            value,
            itemStyle: { color },
          },
          {
            value: total - value,
            itemStyle: { color: '#E4E7EC' },
          },
        ]}
      />
      <div>
        <span className="d-block text-muted mb-1">{title}</span>
        <span className="d-block text-muted mb-1">
          {value}/{total} {unit}
        </span>
        <span className="d-block fw-bold">
          {total ? Number((value / total) * 100).toFixed(1) : 0}%
        </span>
      </div>
    </Stack>
  );
};

export const ClusterStatistics: FC<{
  resourceScope: RancherCluster;
}> = ({ resourceScope }) => {
  const [activeKey, setActiveKey] = useState<string | number | null>(
    'capacity',
  );

  const nodesCount = useMemo(
    () => resourceScope.nodes.length || 0,
    [resourceScope],
  );

  // TODO: update during implemenation of https://opennode.atlassian.net/browse/WAL-8880
  const resourcesCount = useMemo(
    () => (resourceScope?.requested ? resourceScope.requested['resources'] : 0),
    [resourceScope],
  );

  const workloadsCount = useMemo(
    () => (resourceScope?.requested ? resourceScope.requested['workloads'] : 0),
    [resourceScope],
  );

  return (
    <Tab.Container activeKey={activeKey} onSelect={setActiveKey}>
      <Nav variant="tabs" className="nav-line-tabs flex-nowrap">
        <Nav.Item>
          <Nav.Link eventKey="capacity">{translate('Capacity')}</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="storage">{translate('Storage')}</Nav.Link>
        </Nav.Item>
      </Nav>
      <Tab.Content className="pt-10">
        <Row className="g-5 mb-10">
          <Col sm={4}>
            <StatisticsCard
              title={translate('Total resources')}
              value={resourcesCount}
            />
          </Col>
          <Col sm={4}>
            <StatisticsCard title={translate('Nodes')} value={nodesCount} />
          </Col>
          <Col sm={4}>
            <StatisticsCard
              title={translate('Workloads')}
              value={workloadsCount}
            />
          </Col>
        </Row>

        <Row className="mb-10 g-10">
          <Col xs="auto">
            <h4 className="fw-bold mb-7">{translate('Pods')}</h4>
            <StatisticPieChartItem
              title={translate('Used')}
              unit="cores"
              total={110}
              value={7}
              color="#12B76A"
            />
          </Col>
          <Col xs="auto">
            <h4 className="fw-bold mb-7">{translate('CPU')}</h4>
            <Stack direction="horizontal" gap={10}>
              <StatisticPieChartItem
                title={translate('Reserved')}
                unit="cores"
                total={4}
                value={1.53}
                color="#F79009"
              />
              <StatisticPieChartItem
                title={translate('Used')}
                unit="cores"
                total={4}
                value={0.3}
                color="#12B76A"
              />
            </Stack>
          </Col>
          <Col xs="auto">
            <h4 className="fw-bold mb-7">{translate('Memory')}</h4>
            <Stack direction="horizontal" gap={10}>
              <StatisticPieChartItem
                title={translate('Reserved')}
                unit="GiB"
                total={7.76}
                value={2.56}
                color="#F79009"
              />
              <StatisticPieChartItem
                title={translate('Used')}
                unit="GiB"
                total={7.76}
                value={4.46}
                color="#12B76A"
              />
            </Stack>
          </Col>
        </Row>

        <h4 className="fw-bold mb-7">{translate('Network')}</h4>
        <Row className="g-5 mb-10">
          <Col sm={4}>
            <NetworkStatisticsCard
              isIncrease
              title="Ingress"
              change={100}
              value={2.4}
            />
          </Col>
          <Col sm={4}>
            <NetworkStatisticsCard
              isIncrease={false}
              title="Egress"
              change={20}
              value={1.8}
            />
          </Col>
        </Row>
      </Tab.Content>
    </Tab.Container>
  );
};
