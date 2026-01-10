import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  callReviewerPoolsList,
  myAssignmentBatchesList,
  proposalReviewsList,
} from 'waldur-js-client';

import { fetchResultCount } from '@waldur/core/api';
import { Badge } from '@waldur/core/Badge';
import { translate } from '@waldur/i18n';
import { TableTab } from '@waldur/table/types';
import { getUser } from '@waldur/workspace/selectors';

interface TabLabelWithCountProps {
  label: string;
  count?: number;
  variant?: 'primary' | 'warning' | 'danger' | 'success' | 'secondary';
}

const TabLabelWithCount = ({
  label,
  count,
  variant = 'primary',
}: TabLabelWithCountProps) => (
  <span className="d-flex align-items-center gap-2">
    {label}
    {count !== undefined && count > 0 && (
      <Badge variant={variant} size="sm" pill light>
        {count}
      </Badge>
    )}
  </span>
);

export const useMyReviewsTabs = (): TableTab[] => {
  const user = useSelector(getUser);

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
        title: (
          <TabLabelWithCount
            label={translate('Reviews')}
            count={reviewsCount}
            variant="primary"
          />
        ),
        state: 'reviews-all-reviews',
      },
      {
        key: 'assignments',
        title: (
          <TabLabelWithCount
            label={translate('Assignments')}
            count={assignmentsCount}
            variant="warning"
          />
        ),
        state: 'reviews-assignments',
      },
      {
        key: 'invitations',
        title: (
          <TabLabelWithCount
            label={translate('Invitations')}
            count={invitationsCount}
            variant="primary"
          />
        ),
        state: 'reviews-invitations',
      },
      {
        key: 'calls',
        title: (
          <TabLabelWithCount
            label={translate('Calls')}
            count={callsCount}
            variant="success"
          />
        ),
        state: 'reviews-calls',
      },
    ],
    [reviewsCount, assignmentsCount, invitationsCount, callsCount],
  );
};
