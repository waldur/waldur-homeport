import {
  rabbitmqOverviewRetrieve,
  rabbitmqStats,
  rabbitmqStatsRetrieve,
  type RmqPurgeRequestRequest,
} from 'waldur-js-client';

// Re-export types for convenience
export type {
  RmqStatsResponse,
  RmqVhostStats,
  RmqQueueStats,
  RmqStatsUser,
  RmqOverview,
  RmqObjectTotals,
  RmqQueueTotals,
} from 'waldur-js-client';

// GET /api/rabbitmq-stats/ - View queue statistics
export const getRabbitMQStats = () =>
  rabbitmqStatsRetrieve().then((response) => response.data);

// POST /api/rabbitmq-stats/ - Purge or delete queues
const purgeOrDeleteQueues = (body: RmqPurgeRequestRequest) =>
  rabbitmqStats({ body }).then((response) => response.data);

export const purgeRabbitMQQueues = purgeOrDeleteQueues;
export const deleteRabbitMQQueues = purgeOrDeleteQueues;

// GET /api/rabbitmq-overview/ - Cluster overview statistics
export const getRabbitMQOverview = () =>
  rabbitmqOverviewRetrieve().then((response) => response.data);
