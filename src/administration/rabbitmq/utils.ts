import type { RmqQueueStats } from './api';

export type QueueKind = 'consumer' | 'legacy' | 'unknown';

// Unified pub/sub consumer queues are named consumer_{consumer_uuid}.
const CONSUMER_QUEUE_RE = /^consumer_([a-f0-9]{32})$/;

// RabbitMQ's own x-queue-type values. The stats endpoint currently overwrites
// queue_type with its consumer/legacy/unknown classification, so anything
// else is treated as absent until the backend exposes queue_kind separately.
const RMQ_QUEUE_TYPES = new Set(['classic', 'quorum', 'stream']);

export const getConsumerQueueName = (consumerUuid: string): string =>
  `consumer_${consumerUuid.replace(/-/g, '')}`;

export const getConsumerUuid = (queueName: string): string | null =>
  CONSUMER_QUEUE_RE.exec(queueName)?.[1] ?? null;

export const isConsumerQueue = (queueName: string): boolean =>
  CONSUMER_QUEUE_RE.test(queueName);

export const getQueueKind = (
  queue: Pick<RmqQueueStats, 'name' | 'subscription_uuid'>,
): QueueKind => {
  if (isConsumerQueue(queue.name)) return 'consumer';
  if (queue.subscription_uuid) return 'legacy';
  return 'unknown';
};

export const getRmqQueueType = (
  queue: Pick<RmqQueueStats, 'queue_type'>,
): string | null =>
  queue.queue_type && RMQ_QUEUE_TYPES.has(queue.queue_type)
    ? queue.queue_type
    : null;
