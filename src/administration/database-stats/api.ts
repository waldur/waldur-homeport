import { databaseStatsRetrieve } from 'waldur-js-client';

export type {
  DatabaseStatsResponse,
  ConnectionStats,
  CachePerformance,
  TransactionStats,
  LockStats,
  MaintenanceStats,
  ActiveQueriesStats,
  ActiveQuery,
  QueryPerformance,
  ReplicationStats,
  TableSize,
} from 'waldur-js-client';

export const getDatabaseStats = () =>
  databaseStatsRetrieve().then((response) => response.data);
