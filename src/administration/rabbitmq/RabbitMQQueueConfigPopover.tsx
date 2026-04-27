import { GearIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';

import { translate } from '@/i18n';

import type { RmqQueueStats } from './api';

interface RabbitMQQueueConfigPopoverProps {
  queue: RmqQueueStats;
}

const formatMs = (ms: number | null | undefined): string | null => {
  if (ms == null) return null;
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
  return `${(ms / 3600000).toFixed(1)}h`;
};

const formatBytes = (bytes: number | null | undefined): string | null => {
  if (bytes == null) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

export const RabbitMQQueueConfigPopover: FC<
  RabbitMQQueueConfigPopoverProps
> = ({ queue }) => {
  const hasAnyConfig =
    queue.message_ttl != null ||
    queue.max_length != null ||
    queue.max_length_bytes != null ||
    queue.expires != null ||
    queue.overflow != null ||
    queue.dead_letter_exchange != null ||
    queue.dead_letter_routing_key != null ||
    queue.max_priority != null ||
    queue.queue_mode != null;

  if (!hasAnyConfig) {
    return <span className="text-muted">-</span>;
  }

  const configItems: { label: string; value: string }[] = [];

  if (queue.message_ttl != null) {
    configItems.push({
      label: translate('Message TTL'),
      value: formatMs(queue.message_ttl) || '',
    });
  }

  if (queue.expires != null) {
    configItems.push({
      label: translate('Queue expires'),
      value: formatMs(queue.expires) || '',
    });
  }

  if (queue.max_length != null) {
    configItems.push({
      label: translate('Max messages'),
      value: queue.max_length.toLocaleString(),
    });
  }

  if (queue.max_length_bytes != null) {
    configItems.push({
      label: translate('Max size'),
      value: formatBytes(queue.max_length_bytes) || '',
    });
  }

  if (queue.overflow != null) {
    configItems.push({
      label: translate('Overflow'),
      value: queue.overflow,
    });
  }

  if (queue.dead_letter_exchange != null) {
    configItems.push({
      label: translate('DLX exchange'),
      value: queue.dead_letter_exchange,
    });
  }

  if (queue.dead_letter_routing_key != null) {
    configItems.push({
      label: translate('DLX routing key'),
      value: queue.dead_letter_routing_key,
    });
  }

  if (queue.max_priority != null) {
    configItems.push({
      label: translate('Max priority'),
      value: String(queue.max_priority),
    });
  }

  if (queue.queue_mode != null) {
    configItems.push({
      label: translate('Queue mode'),
      value: queue.queue_mode,
    });
  }

  const popover = (
    <Popover id={`queue-config-${queue.name}`}>
      <Popover.Header as="h3">
        {translate('Queue configuration')}
      </Popover.Header>
      <Popover.Body>
        <table className="table table-sm table-borderless mb-0">
          <tbody>
            {configItems.map((item, index) => (
              <tr key={index}>
                <td className="text-muted pe-3">{item.label}</td>
                <td className="fw-semibold">
                  <code>{item.value}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Popover.Body>
    </Popover>
  );

  return (
    <OverlayTrigger
      trigger={['hover', 'focus']}
      placement="left"
      overlay={popover}
    >
      <span className="cursor-pointer text-info">
        <GearIcon size={18} weight="bold" />
      </span>
    </OverlayTrigger>
  );
};
