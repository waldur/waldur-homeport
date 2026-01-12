import { WarningCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Card, Col, Row } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { formatJsxTemplate } from '@waldur/i18n/translate';

import type { RmqStatsResponse } from './api';
import { getQueueHealth } from './RabbitMQQueueHealthBadge';

interface RabbitMQOverviewCardsProps {
  data: RmqStatsResponse;
}

const MESSAGE_WARNING_THRESHOLD = 100000;

export const RabbitMQOverviewCards: FC<RabbitMQOverviewCardsProps> = ({
  data,
}) => {
  const isHighMessageCount = data.total_messages > MESSAGE_WARNING_THRESHOLD;

  // Count vhosts with issues (any queue without consumers and messages > 0)
  const vhostsWithIssues = data.vhosts.filter((vhost) =>
    vhost.queues.some(
      (queue) =>
        getQueueHealth(queue) === 'critical' ||
        getQueueHealth(queue) === 'alert',
    ),
  ).length;

  return (
    <Row className="mb-6">
      <Col md={6} lg={4}>
        <Card className="card-bordered mb-5">
          <Card.Body>
            <div className="d-flex align-items-center">
              <strong
                className={`d-block display-4 ${isHighMessageCount ? 'text-danger' : 'text-success'}`}
              >
                {data.total_messages.toLocaleString()}
              </strong>
              {isHighMessageCount && (
                <WarningCircleIcon
                  size={24}
                  weight="bold"
                  className="text-danger ms-2"
                />
              )}
            </div>
            <strong className="d-block mb-2">
              {translate('Total messages')}
            </strong>
            {isHighMessageCount && (
              <small className="text-danger">
                {formatJsxTemplate(translate('Exceeds {threshold} threshold'), {
                  threshold: MESSAGE_WARNING_THRESHOLD.toLocaleString(),
                })}
              </small>
            )}
          </Card.Body>
        </Card>
      </Col>
      <Col md={6} lg={4}>
        <Card className="card-bordered mb-5">
          <Card.Body>
            <strong className="d-block display-4 text-success">
              {data.total_queues.toLocaleString()}
            </strong>
            <strong className="d-block mb-2">
              {translate('Total queues')}
            </strong>
          </Card.Body>
        </Card>
      </Col>
      <Col md={6} lg={4}>
        <Card className="card-bordered mb-5">
          <Card.Body>
            <strong
              className={`d-block display-4 ${vhostsWithIssues > 0 ? 'text-warning' : 'text-success'}`}
            >
              {vhostsWithIssues}
            </strong>
            <strong className="d-block mb-2">
              {translate('Vhosts needing attention')}
            </strong>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};
