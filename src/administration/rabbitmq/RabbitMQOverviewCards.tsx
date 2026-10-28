import { WarningCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { translate } from '@/i18n';
import { formatJsxTemplate } from '@/i18n/translate';

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-5 mb-5">
      <div>
        <div className="card card-bordered mb-4">
          <div className="card-body">
            <div className="flex items-center">
              <strong
                className={`block display-4 ${isHighMessageCount ? 'text-danger' : 'text-success'}`}
              >
                {data.total_messages.toLocaleString()}
              </strong>
              {isHighMessageCount && (
                <WarningCircleIcon
                  size={24}
                  weight="bold"
                  className="text-danger ms-1.5"
                />
              )}
            </div>
            <strong className="block mb-1.5">
              {translate('Total messages')}
            </strong>
            {isHighMessageCount && (
              <small className="text-danger">
                {formatJsxTemplate(translate('Exceeds {threshold} threshold'), {
                  threshold: MESSAGE_WARNING_THRESHOLD.toLocaleString(),
                })}
              </small>
            )}
          </div>
        </div>
      </div>
      <div>
        <div className="card card-bordered mb-4">
          <div className="card-body">
            <strong className="block display-4 text-success">
              {data.total_queues.toLocaleString()}
            </strong>
            <strong className="block mb-1.5">
              {translate('Total queues')}
            </strong>
          </div>
        </div>
      </div>
      <div>
        <div className="card card-bordered mb-4">
          <div className="card-body">
            <strong
              className={`block display-4 ${vhostsWithIssues > 0 ? 'text-warning' : 'text-success'}`}
            >
              {vhostsWithIssues}
            </strong>
            <strong className="block mb-1.5">
              {translate('Vhosts needing attention')}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};
