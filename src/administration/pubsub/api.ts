import {
  debugPubsubCircuitBreakerReset,
  debugPubsubCircuitBreakerRetrieve,
  debugPubsubDeadLetterQueueRetrieve,
  debugPubsubMetricsReset,
  debugPubsubMetricsRetrieve,
  debugPubsubOverviewRetrieve,
  debugPubsubQueuesRetrieve,
} from 'waldur-js-client';

// Re-export types from SDK
export type { PubsubOverview } from 'waldur-js-client';

// API Functions wrapping SDK calls
export const getPubSubOverview = () =>
  debugPubsubOverviewRetrieve().then((response) => response.data);

export const getCircuitBreaker = () =>
  debugPubsubCircuitBreakerRetrieve().then((response) => response.data);

export const resetCircuitBreaker = () =>
  debugPubsubCircuitBreakerReset().then((response) => response.data);

export const getPubSubMetrics = () =>
  debugPubsubMetricsRetrieve().then((response) => response.data);

export const resetPubSubMetrics = () =>
  debugPubsubMetricsReset().then((response) => response.data);

export const getTopQueues = () =>
  debugPubsubQueuesRetrieve().then((response) => response.data);

export const getDeadLetterQueue = () =>
  debugPubsubDeadLetterQueueRetrieve().then((response) => response.data);
