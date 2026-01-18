export type HealthLevel = 'success' | 'warning' | 'danger';

/**
 * Get health level for overall PubSub status
 */
export const getHealthStatusLevel = (status: string): HealthLevel => {
  switch (status) {
    case 'healthy':
      return 'success';
    case 'degraded':
      return 'warning';
    case 'critical':
      return 'danger';
    default:
      return 'warning';
  }
};

/**
 * Get health level for circuit breaker state
 */
export const getCircuitBreakerLevel = (state: string): HealthLevel => {
  switch (state) {
    case 'closed':
      return 'success';
    case 'half_open':
      return 'warning';
    case 'open':
      return 'danger';
    default:
      return 'warning';
  }
};

/**
 * Get health level for success rate
 */
export const getSuccessRateLevel = (failureRate: string): HealthLevel => {
  const rate = parseFloat(failureRate);
  if (isNaN(rate)) return 'success';
  if (rate > 10) return 'danger';
  if (rate > 1) return 'warning';
  return 'success';
};

/**
 * Get health level for DLQ message count
 */
export const getDlqLevel = (count: number): HealthLevel => {
  if (count > 100) return 'danger';
  if (count > 0) return 'warning';
  return 'success';
};

/**
 * Get CSS text class for health level
 */
export const getTextClass = (health: HealthLevel): string => {
  switch (health) {
    case 'danger':
      return 'text-danger';
    case 'warning':
      return 'text-warning';
    default:
      return 'text-success';
  }
};

/**
 * Format Unix timestamp to date string
 */
export const formatTimestamp = (timestamp: number | null): string => {
  if (timestamp === null) return '-';
  return new Date(timestamp * 1000).toLocaleString();
};

/**
 * Format latency in milliseconds
 */
export const formatLatency = (ms: number | null): string => {
  if (ms === null || ms === undefined) return '-';
  if (ms < 1) return '<1ms';
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};

/**
 * Format circuit breaker state for display
 */
export const formatCircuitBreakerState = (state: string): string => {
  switch (state) {
    case 'closed':
      return 'Closed';
    case 'half_open':
      return 'Half Open';
    case 'open':
      return 'Open';
    default:
      return state;
  }
};

/**
 * Format number with locale string
 */
export const formatNumber = (value: number): string => {
  return value.toLocaleString();
};
