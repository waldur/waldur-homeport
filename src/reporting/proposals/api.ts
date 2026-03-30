// eslint-disable-next-line waldur-custom/no-direct-client-usage
import { get } from '@waldur/core/api';

import {
  CallPerformanceData,
  ReviewProgressData,
  ResourceDemandData,
} from './types';

export const getCallPerformanceStats = () =>
  get<CallPerformanceData[]>(
    `/api/call-managing-organisations/global_stats_performance/`,
  );

export const getReviewProgressStats = () =>
  get<ReviewProgressData[]>(
    `/api/call-managing-organisations/global_stats_review_progress/`,
  );

export const getResourceDemandStats = () =>
  get<ResourceDemandData[]>(
    `/api/call-managing-organisations/global_stats_resource_demand/`,
  );
