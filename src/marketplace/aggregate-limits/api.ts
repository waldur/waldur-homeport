import { get } from '@waldur/core/api';

import { AggregateLimitStatsResponse } from './types';

export const getProjectStats = (projectUUID: string) =>
  get<AggregateLimitStatsResponse>(`/projects/${projectUUID}/stats/`);

export const getCustomerStats = (customerUUID: string) =>
  get<AggregateLimitStatsResponse>(`/customers/${customerUUID}/stats/`);
