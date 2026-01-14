export type HealthLevel = 'success' | 'warning' | 'danger';

/**
 * Get health level for connection utilization
 * Green: < 60%, Yellow: 60-80%, Red: > 80%
 */
export const getConnectionHealth = (
  utilizationPercent: number,
): HealthLevel => {
  if (utilizationPercent > 80) return 'danger';
  if (utilizationPercent >= 60) return 'warning';
  return 'success';
};

/**
 * Get health level for cache hit ratio
 * Green: > 99%, Yellow: 95-99%, Red: < 95%
 */
export const getCacheHealth = (hitRatio: number | null): HealthLevel => {
  if (hitRatio == null) return 'success';
  if (hitRatio < 95) return 'danger';
  if (hitRatio < 99) return 'warning';
  return 'success';
};

/**
 * Get health level for dead tuple ratio
 * Green: < 5%, Yellow: 5-10%, Red: > 10%
 */
export const getDeadTupleHealth = (
  deadTupleRatioPercent: number | null,
): HealthLevel => {
  if (deadTupleRatioPercent == null) return 'success';
  if (deadTupleRatioPercent > 10) return 'danger';
  if (deadTupleRatioPercent >= 5) return 'warning';
  return 'success';
};

/**
 * Get health level for waiting locks
 * Green: 0, Yellow: 1-5, Red: > 5
 */
export const getLocksHealth = (waitingLocks: number): HealthLevel => {
  if (waitingLocks > 5) return 'danger';
  if (waitingLocks > 0) return 'warning';
  return 'success';
};

/**
 * Get health level for longest query duration
 * Green: < 10s, Yellow: 10-60s, Red: > 60s
 */
export const getQueryDurationHealth = (
  durationSeconds: number,
): HealthLevel => {
  if (durationSeconds > 60) return 'danger';
  if (durationSeconds >= 10) return 'warning';
  return 'success';
};

/**
 * Get health level for rollback ratio
 * Green: < 0.1%, Yellow: 0.1-1%, Red: > 1%
 */
export const getRollbackHealth = (
  rollbackRatioPercent: number,
): HealthLevel => {
  if (rollbackRatioPercent > 1) return 'danger';
  if (rollbackRatioPercent >= 0.1) return 'warning';
  return 'success';
};

/**
 * Format duration in seconds to human-readable format
 */
export const formatDuration = (seconds: number): string => {
  if (seconds < 1) return `${(seconds * 1000).toFixed(0)}ms`;
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  if (seconds < 3600) return `${(seconds / 60).toFixed(1)}m`;
  return `${(seconds / 3600).toFixed(1)}h`;
};

/**
 * Format large numbers with locale string
 */
export const formatNumber = (value: number): string => {
  return value.toLocaleString();
};

/**
 * Format percentage value
 */
export const formatPercent = (value: number | null): string => {
  if (value == null) return '-';
  return `${value.toFixed(1)}%`;
};
