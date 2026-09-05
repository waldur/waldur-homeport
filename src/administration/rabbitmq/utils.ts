// Unified pub/sub consumer queues are named consumer_{consumer_uuid}.
export const getConsumerQueueName = (consumerUuid: string): string =>
  `consumer_${consumerUuid.replace(/-/g, '')}`;
