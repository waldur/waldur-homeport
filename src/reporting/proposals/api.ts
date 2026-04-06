// eslint-disable-next-line waldur-custom/no-direct-client-usage
import { get } from '@waldur/core/api';

import {
  CallPerformanceData,
  ReviewProgressData,
  ResourceDemandData,
} from './types';

export const getCallPerformanceStats = () =>
  get<CallPerformanceData[]>(
    `/call-managing-organisations/global_stats_performance/`,
  );

export const getReviewProgressStats = () =>
  get<ReviewProgressData[]>(
    `/call-managing-organisations/global_stats_review_progress/`,
  );

export const getResourceDemandStats = () =>
  get<ResourceDemandData[]>(
    `/call-managing-organisations/global_stats_resource_demand/`,
  );
