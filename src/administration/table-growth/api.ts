import { statsTableGrowthRetrieve } from 'waldur-js-client';

export type {
  TableGrowthStats,
  TableGrowthStatsResponse,
} from 'waldur-js-client';

export const getTableGrowth = () =>
  statsTableGrowthRetrieve().then((response) => response.data);
