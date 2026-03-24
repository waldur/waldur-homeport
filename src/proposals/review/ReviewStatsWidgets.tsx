import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  callReviewerPoolsList,
  proposalReviewsList,
  reviewerProfilesMeRetrieve,
  ReviewerProfile,
} from 'waldur-js-client';

import { fetchResultCount } from '@waldur/core/api';
import { SummaryWidget } from '@waldur/core/SummaryWidget';
import { translate } from '@waldur/i18n';
import { getUser } from '@waldur/workspace/selectors';

export const ReviewStatsWidgets: FC = () => {
  const user = useSelector(getUser);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['reviewer-profile-me-stats'],
    queryFn: async () => {
      try {
        const response = await reviewerProfilesMeRetrieve();
        return response.data as ReviewerProfile;
      } catch (error) {
        if ((error as any)?.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
  });

  // Count reviews in progress (state = in_review)
  const { data: inProgressCount = 0 } = useQuery({
    queryKey: ['reviews-in-progress-count', user?.uuid],
    queryFn: async () => {
      const response = await proposalReviewsList({
        query: {
          reviewer_uuid: user?.uuid,
          state: ['in_review'],
          page_size: 1,
        },
      });
      return fetchResultCount(response);
    },
    enabled: !!user?.uuid,
  });

  // Count pending invitations
  const { data: invitationsCount = 0 } = useQuery({
    queryKey: ['invitations-pending-count'],
    queryFn: async () => {
      const response = await callReviewerPoolsList({
        query: {
          invitation_status: ['pending'],
          my_invitations: true,
          page_size: 1,
        },
      });
      return fetchResultCount(response);
    },
  });

  // Use stats from profile or default to zeros
  const statsFromProfile = profile?.stats ?? {
    total_reviews_completed: 0,
    average_review_time_days: null,
  };

  const summary = useMemo(
    () => [
      {
        label: translate('Invitations'),
        value: invitationsCount,
      },
      {
        label: translate('In progress'),
        value: inProgressCount,
      },
      {
        label: translate('Completed'),
        value: statsFromProfile.total_reviews_completed,
      },
      {
        label: translate('Avg. review time'),
        value:
          statsFromProfile.average_review_time_days !== null
            ? translate('{days} days', {
                days: statsFromProfile.average_review_time_days.toFixed(1),
              })
            : '-',
      },
    ],
    [invitationsCount, inProgressCount, statsFromProfile],
  );

  if (profileLoading) {
    return null;
  }

  return <SummaryWidget stats={summary} />;
};
