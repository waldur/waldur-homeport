import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { Col, Row, Table } from 'react-bootstrap';

import { AccordionCard, Badge } from 'waldur-ui';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { renderFieldOrDash } from '@/table/utils';

import {
  getRabbitMQOverview,
  type RmqOverview,
  type RmqObjectTotals,
  type RmqQueueTotals,
} from './api';

interface ClusterInfoRowProps {
  label: string;
  value: string | number;
}

const ClusterInfoRow: FC<ClusterInfoRowProps> = ({ label, value }) => (
  <div className="d-flex justify-content-between py-1">
    <span className="text-quaternary">{label}</span>
    <span>{value}</span>
  </div>
);

interface RabbitMQClusterOverviewContentProps {
  data: RmqOverview;
}

const RabbitMQClusterOverviewContent: FC<
  RabbitMQClusterOverviewContentProps
> = ({ data }) => {
  const objectTotals: Partial<RmqObjectTotals> = data.object_totals || {};
  const queueTotals: Partial<RmqQueueTotals> = data.queue_totals || {};

  return (
    <Row>
      <Col md={4}>
        <h6 className="text-uppercase text-quaternary mb-3">
          {translate('Cluster info')}
        </h6>
        <ClusterInfoRow
          label={translate('Cluster name')}
          value={renderFieldOrDash(data.cluster_name)}
        />
        <ClusterInfoRow
          label={translate('RabbitMQ version')}
          value={renderFieldOrDash(data.rabbitmq_version)}
        />
        <ClusterInfoRow
          label={translate('Erlang version')}
          value={renderFieldOrDash(data.erlang_version)}
        />
        <ClusterInfoRow
          label={translate('Node')}
          value={renderFieldOrDash(data.node)}
        />
      </Col>

      <Col md={4}>
        <h6 className="text-uppercase text-quaternary mb-3">
          {translate('Object totals')}
        </h6>
        <Table size="sm" borderless className="mb-0">
          <tbody>
            <tr>
              <td className="text-quaternary">{translate('Connections')}</td>
              <td className="text-end">
                {(objectTotals.connections ?? 0).toLocaleString()}
              </td>
            </tr>
            <tr>
              <td className="text-quaternary">{translate('Channels')}</td>
              <td className="text-end">
                {(objectTotals.channels ?? 0).toLocaleString()}
              </td>
            </tr>
            <tr>
              <td className="text-quaternary">{translate('Exchanges')}</td>
              <td className="text-end">
                {(objectTotals.exchanges ?? 0).toLocaleString()}
              </td>
            </tr>
            <tr>
              <td className="text-quaternary">{translate('Queues')}</td>
              <td className="text-end">
                {(objectTotals.queues ?? 0).toLocaleString()}
              </td>
            </tr>
            <tr>
              <td className="text-quaternary">{translate('Consumers')}</td>
              <td className="text-end">
                {(objectTotals.consumers ?? 0).toLocaleString()}
              </td>
            </tr>
          </tbody>
        </Table>
      </Col>

      <Col md={4}>
        <h6 className="text-uppercase text-quaternary mb-3">
          {translate('Queue totals')}
        </h6>
        <Table size="sm" borderless className="mb-0">
          <tbody>
            <tr>
              <td className="text-quaternary">{translate('Total messages')}</td>
              <td className="text-end">
                {(queueTotals.messages ?? 0).toLocaleString()}
              </td>
            </tr>
            <tr>
              <td className="text-quaternary">{translate('Ready')}</td>
              <td className="text-end">
                {(queueTotals.messages_ready ?? 0).toLocaleString()}
              </td>
            </tr>
            <tr>
              <td className="text-quaternary">{translate('Unacknowledged')}</td>
              <td className="text-end">
                {(queueTotals.messages_unacknowledged ?? 0).toLocaleString()}
              </td>
            </tr>
          </tbody>
        </Table>

        {data.listeners && data.listeners.length > 0 && (
          <>
            <h6 className="text-uppercase text-quaternary mb-3 mt-4">
              {translate('Listeners')}
            </h6>
            <div className="d-flex flex-wrap gap-2">
              {data.listeners.map((listener, index) => (
                <Badge key={index} variant="neutral" tone="light">
                  {listener.protocol}:{listener.port}
                </Badge>
              ))}
            </div>
          </>
        )}
      </Col>
    </Row>
  );
};

export const RabbitMQClusterOverview: FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['RabbitMQOverview'],
    queryFn: getRabbitMQOverview,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  return (
    <AccordionCard
      id="rabbitmq-cluster-overview"
      title={translate('Cluster overview')}
      subtitle={translate('RabbitMQ cluster health and configuration details')}
      defaultOpen={false}
      className="mb-6"
    >
      {isLoading && (
        <div className="text-center py-4">
          <LoadingSpinner />
        </div>
      )}
      {error && (
        <div className="text-danger">
          {translate('Failed to load cluster overview')}
        </div>
      )}
      {data && <RabbitMQClusterOverviewContent data={data} />}
    </AccordionCard>
  );
};
