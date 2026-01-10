import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import {
  reviewerProfilesMeRetrieve,
  reviewerProfilesMe,
  reviewerProfilesMePartialUpdate,
  ReviewerProfile,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { useNotify } from '@waldur/store/hooks';

export const useReviewerProfile = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showErrorResponse } = useNotify();

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
        return response.data as ReviewerProfile;
      } catch (e) {
        if (e.response?.status === 404) {
          return null;
        }
        throw e;
      }
    },
    retry: false,
  });

  const createProfileMutation = useMutation({
    mutationFn: async () => {
      const response = await reviewerProfilesMe({ body: {} });
      return response.data;
    },
    onSuccess: () => {
      showSuccess(translate('Reviewer profile created.'));
      queryClient.invalidateQueries({ queryKey: ['reviewer-profile-me'] });
    },
    onError: (error) => {
      showErrorResponse(error, translate('Unable to create reviewer profile.'));
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<ReviewerProfile>) => {
      const response = await reviewerProfilesMePartialUpdate({ body: data });
      return response.data;
    },
    onSuccess: () => {
      showSuccess(translate('Reviewer profile updated.'));
      queryClient.invalidateQueries({ queryKey: ['reviewer-profile-me'] });
    },
    onError: (error) => {
      showErrorResponse(error, translate('Unable to update reviewer profile.'));
    },
  });

  const handleCreateProfile = useCallback(() => {
    createProfileMutation.mutate();
  }, [createProfileMutation]);

  return {
    profile,
    isLoading,
    error,
    refetch,
    createProfile: handleCreateProfile,
    isCreating: createProfileMutation.isPending,
    updateProfile: updateProfileMutation.mutate,
    isUpdating: updateProfileMutation.isPending,
  };
};
