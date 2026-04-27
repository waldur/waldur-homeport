import { useQuery } from '@tanstack/react-query';
import {
  callManagingOrganisationsGlobalStatsPerformanceList,
  callManagingOrganisationsGlobalStatsResourceDemandList,
  callManagingOrganisationsGlobalStatsReviewProgressList,
} from 'waldur-js-client';

export const useCallPerformanceStats = () => {
  return useQuery({
    queryKey: ['callPerformanceStats'],
    queryFn: () => callManagingOrganisationsGlobalStatsPerformanceList(),
  });
};

export const useReviewProgressStats = () => {
  return useQuery({
    queryKey: ['reviewProgressStats'],
    queryFn: () => callManagingOrganisationsGlobalStatsReviewProgressList(),
  });
};

export const useResourceDemandStats = () => {
  return useQuery({
    queryKey: ['resourceDemandStats'],
    queryFn: () => callManagingOrganisationsGlobalStatsResourceDemandList(),
  });
};
