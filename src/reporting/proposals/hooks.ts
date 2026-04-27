import { useQuery } from '@tanstack/react-query';
import {
  callManagingOrganisationsGlobalStatsPerformanceList,
  callManagingOrganisationsGlobalStatsResourceDemandList,
  callManagingOrganisationsGlobalStatsReviewProgressList,
} from 'waldur-js-client';

export const useCallPerformanceStats = () => {
  return useQuery({
    queryKey: ['callPerformanceStats'],
    queryFn: () =>
      callManagingOrganisationsGlobalStatsPerformanceList().then((r) => r.data),
  });
};

export const useReviewProgressStats = () => {
  return useQuery({
    queryKey: ['reviewProgressStats'],
    queryFn: () =>
      callManagingOrganisationsGlobalStatsReviewProgressList().then(
        (r) => r.data,
      ),
  });
};

export const useResourceDemandStats = () => {
  return useQuery({
    queryKey: ['resourceDemandStats'],
    queryFn: () =>
      callManagingOrganisationsGlobalStatsResourceDemandList().then(
        (r) => r.data,
      ),
  });
};
