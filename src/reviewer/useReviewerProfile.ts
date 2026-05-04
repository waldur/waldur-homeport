import { useQuery } from '@tanstack/react-query';
import { reviewerProfilesMeRetrieve } from 'waldur-js-client';

export const useReviewerProfile = () => {
  const {
    data: profile,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['reviewer-profile-me'],
    queryFn: async () => {
      try {
        const response = await reviewerProfilesMeRetrieve();
        return response.data;
      } catch (e) {
        if (e.response?.status === 404) {
          return null;
        }
        throw e;
      }
    },
    retry: false,
  });

  return {
    profile,
    isLoading,
    error,
    refetch,
  };
};
