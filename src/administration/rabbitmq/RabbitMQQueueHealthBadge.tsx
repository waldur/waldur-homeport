import { FC } from 'react';

import { Badge } from '@/core/Badge';
import { translate } from '@/i18n';

import type { RmqQueueStats } from './api';

type QueueHealthStatus = 'healthy' | 'warning' | 'alert' | 'critical';

export const getQueueHealth = (
  queue: Pick<RmqQueueStats, 'messages' | 'consumers'>,
): QueueHealthStatus => {
  if (queue.consumers > 0) return 'healthy';
  if (queue.messages < 1000) return 'warning';
  if (queue.messages < 10000) return 'alert';
  return 'critical';
};

const healthConfig: Record<
  QueueHealthStatus,
  { variant: string; label: string }
> = {
  healthy: { variant: 'success', label: translate('Healthy') },
  warning: { variant: 'warning', label: translate('Warning') },
  alert: { variant: 'orange', label: translate('Alert') },
  critical: { variant: 'danger', label: translate('Critical') },
};

interface RabbitMQQueueHealthBadgeProps {
  queue: Pick<RmqQueueStats, 'messages' | 'consumers'>;
}

export const RabbitMQQueueHealthBadge: FC<RabbitMQQueueHealthBadgeProps> = ({
  queue,
}) => {
  const status = getQueueHealth(queue);
  const config = healthConfig[status];

  return (
    <Badge variant={config.variant} pill outline>
      {config.label}
    </Badge>
  );
};

interface RabbitMQVhostHealthBadgeProps {
  queues: RmqQueueStats[];
}

export const RabbitMQVhostHealthBadge: FC<RabbitMQVhostHealthBadgeProps> = ({
  queues,
}) => {
  // Determine worst status across all queues
  const statuses = queues.map(getQueueHealth);
  let worstStatus: QueueHealthStatus = 'healthy';

  if (statuses.includes('critical')) {
    worstStatus = 'critical';
  } else if (statuses.includes('alert')) {
    worstStatus = 'alert';
  } else if (statuses.includes('warning')) {
    worstStatus = 'warning';
  }

  const config = healthConfig[worstStatus];

  return (
    <Badge variant={config.variant} pill outline>
      {config.label}
    </Badge>
  );
};
