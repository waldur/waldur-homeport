import { FC } from 'react';
import { Col, ProgressBar, Row, Table } from 'react-bootstrap';

import { AccordionCard } from '@waldur/core/AccordionCard';
import { translate } from '@waldur/i18n';

import type { ConnectionStats } from './api';
import { getConnectionHealth } from './utils';

interface DatabaseConnectionsCardProps {
  data: ConnectionStats;
}

export const DatabaseConnectionsCard: FC<DatabaseConnectionsCardProps> = ({
  data,
}) => {
  const health = getConnectionHealth(data.utilization_percent);
  const progressVariant =
    health === 'danger'
      ? 'danger'
      : health === 'warning'
        ? 'warning'
        : 'success';

  return (
    <AccordionCard
      id="database-connections"
      title={translate('Connections')}
      subtitle={translate('{used} of {max} connections ({percent}%)', {
        used: data.active + data.idle,
        max: data.max_connections,
        percent: data.utilization_percent.toFixed(1),
      })}
      defaultOpen={health !== 'success'}
      className="mb-6"
    >
      <Row>
        <Col lg={6}>
          <h6 className="text-uppercase text-muted mb-3">
            {translate('Connection breakdown')}
          </h6>
          <Table size="sm" borderless className="mb-0">
            <tbody>
              <tr>
                <td className="text-muted">{translate('Active')}</td>
                <td className="fw-semibold text-end">
                  {data.active.toLocaleString()}
                </td>
              </tr>
              <tr>
                <td className="text-muted">{translate('Idle')}</td>
                <td className="fw-semibold text-end">
                  {data.idle.toLocaleString()}
                </td>
              </tr>
              <tr>
                <td className="text-muted">
                  {translate('Idle in transaction')}
                </td>
                <td
                  className={`fw-semibold text-end ${data.idle_in_transaction > 5 ? 'text-warning' : ''}`}
                >
                  {data.idle_in_transaction.toLocaleString()}
                </td>
              </tr>
              <tr>
                <td className="text-muted">{translate('Waiting')}</td>
                <td
                  className={`fw-semibold text-end ${data.waiting > 0 ? 'text-danger' : ''}`}
                >
                  {data.waiting.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </Table>
        </Col>
        <Col lg={6}>
          <h6 className="text-uppercase text-muted mb-3">
            {translate('Utilization')}
          </h6>
          <ProgressBar
            now={data.utilization_percent}
            variant={progressVariant}
            label={`${data.utilization_percent.toFixed(1)}%`}
            className="mb-3"
            style={{ height: '24px' }}
          />
          <small className="text-muted">
            {translate('Max connections: {max}', { max: data.max_connections })}
          </small>
        </Col>
      </Row>
    </AccordionCard>
  );
};
