import { useQuery } from '@tanstack/react-query';

import {
  getCallPerformanceStats,
  getReviewProgressStats,
  getResourceDemandStats,
} from './api';

export const useCallPerformanceStats = () => {
  return useQuery({
    queryKey: ['callPerformanceStats'],
    queryFn: () => getCallPerformanceStats(),
  });
};

export const useReviewProgressStats = () => {
  return useQuery({
    queryKey: ['reviewProgressStats'],
    queryFn: () => getReviewProgressStats(),
  });
};

export const useResourceDemandStats = () => {
  return useQuery({
    queryKey: ['resourceDemandStats'],
    queryFn: () => getResourceDemandStats(),
  });
};
