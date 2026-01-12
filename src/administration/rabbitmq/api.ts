import { rabbitmqStatsRetrieve, type RmqPurgeResponse } from 'waldur-js-client';
import { client } from 'waldur-js-client/client.gen';

// Re-export types for convenience
export type {
  RmqStatsResponse,
  RmqVhostStats,
  RmqQueueStats,
  RmqStatsUser,
} from 'waldur-js-client';

// GET /api/rabbitmq-stats/ - uses SDK function
export const getRabbitMQStats = () =>
  rabbitmqStatsRetrieve().then((response) => response.data);

// Purge request types (not in SDK because DELETE body isn't typed in OpenAPI)
interface PurgeQueueRequest {
  vhost: string;
  queue_name: string;
}

interface PurgePatternRequest {
  vhost: string;
  queue_pattern: string;
}

interface PurgeAllRequest {
  purge_all_subscription_queues: true;
}

type PurgeRequest = PurgeQueueRequest | PurgePatternRequest | PurgeAllRequest;

// DELETE /api/rabbitmq-stats/ - uses direct client call (body not typed in SDK)
export const purgeRabbitMQQueues = (data: PurgeRequest) =>
  client
    .delete<RmqPurgeResponse>({
      url: '/api/rabbitmq-stats/',
      body: data as unknown,
      security: [{ name: 'Authorization', type: 'apiKey' }],
    })
    .then((response) => response as unknown as { data: RmqPurgeResponse });
