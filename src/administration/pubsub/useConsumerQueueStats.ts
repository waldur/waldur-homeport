import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { FAST_STALE_TIME } from '@/core/constants';

import { getRabbitMQStats } from '../rabbitmq/api';

import { QueueStats } from './eventConsumers';

/** RabbitMQ queue statistics by queue name, from one cached snapshot. */
export const useConsumerQueueStats = (enabled: boolean) => {
  const { data, isError } = useQuery({
    queryKey: ['RabbitMQStats'],
    queryFn: getRabbitMQStats,
    staleTime: FAST_STALE_TIME,
    retry: false,
    enabled,
  });
  const byQueue = useMemo(() => {
    const byQueue = new Map<string, QueueStats>();
    for (const vhost of data?.vhosts ?? []) {
      for (const queue of vhost.queues) {
        byQueue.set(queue.name, {
          messages: queue.messages,
          consumers: queue.consumers,
        });
      }
    }
    return byQueue;
  }, [data]);
  return { byQueue, statsUnavailable: isError };
};
