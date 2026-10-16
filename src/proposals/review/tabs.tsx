import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  callReviewerPoolsList,
  myAssignmentBatchesList,
  proposalReviewsList,
} from 'waldur-js-client';

import { fetchResultCount } from '@/core/api';
import { translate } from '@/i18n';
import { TableTab } from '@/table/types';
import { useUser } from '@/workspace/hooks';

export const useMyReviewsTabs = (): TableTab[] => {
  const user = useUser();

  // Count all reviews assigned to user
  const { data: reviewsCount = 0 } = useQuery({
    queryKey: ['reviews-count', user?.uuid],
    queryFn: async () => {
      const response = await proposalReviewsList({
        query: {
          reviewer_uuid: user?.uuid,
          page_size: 1,
        },
      });
      return fetchResultCount(response);
    },
    enabled: !!user?.uuid,
  });

  // Count pending assignment batches (sent status - waiting for reviewer response)
  // Note: myAssignmentBatchesList doesn't support query params, so we count the array directly
  const { data: assignmentsCount = 0 } = useQuery({
    queryKey: ['my-assignments-pending-count'],
    queryFn: async () => {
      const response = await myAssignmentBatchesList();
      return response.data?.length || 0;
    },
  });

  // Count pending invitations
  const { data: invitationsCount = 0 } = useQuery({
    queryKey: ['invitations-pending-count-tabs'],
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

  // Count accepted calls (active in reviewer pool)
  const { data: callsCount = 0 } = useQuery({
    queryKey: ['my-calls-count', user?.uuid],
    queryFn: async () => {
      const response = await callReviewerPoolsList({
        query: {
          invitation_status: ['accepted'],
          my_invitations: true,
          page_size: 1,
        },
      });
      return fetchResultCount(response);
    },
    enabled: !!user?.uuid,
  });

  return useMemo(
    () => [
      {
        key: 'reviews',
        title: translate('Reviews'),
        count: reviewsCount || undefined,
        state: 'reviews-all-reviews',
      },
      {
        key: 'assignments',
        title: translate('Assignments'),
        count: assignmentsCount || undefined,
        state: 'reviews-assignments',
      },
      {
        key: 'invitations',
        title: translate('Invitations'),
        count: invitationsCount || undefined,
        state: 'reviews-invitations',
      },
      {
        key: 'calls',
        title: translate('Calls'),
        count: callsCount || undefined,
        state: 'reviews-calls',
      },
    ],
    [reviewsCount, assignmentsCount, invitationsCount, callsCount],
  );
};
