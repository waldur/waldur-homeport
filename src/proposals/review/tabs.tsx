import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import { useEffect, useMemo } from 'react';
import {
  callReviewerPoolsList,
  myAssignmentBatchesList,
  proposalReviewsList,
  proposalRoleAssignmentsList,
} from 'waldur-js-client';

import { fetchResultCount } from '@/core/api';
import { translate } from '@/i18n';
import { TableTab } from '@/table/types';
import { useUser } from '@/workspace/hooks';

import { preloadTabPages } from './tabPreload';
import { useMyTasksCount } from './useMyTasksCount';

/**
 * A tally after a tab title; zero shows none. Neutral, like the call state
 * tabs: a colour per tab reads as a status, which a count is not.
 */
const tally = (count: number) => count || undefined;

/** Holds a call role whose work these tabs list. */
const hasReviewerRole = (user) =>
  Boolean(
    user?.permissions?.some(
      (permission) =>
        permission.scope_type === 'call' &&
        ['CALL.REVIEWER', 'CALL.PANEL_MEMBER'].includes(permission.role_name),
    ),
  );

export const useMyReviewsTabs = (): TableTab[] => {
  const user = useUser();
  const { state } = useCurrentStateAndParams();
  // Load every tab's page now: switching tab then mounts it without a
  // spinner frame, which read as the page blinking.
  useEffect(() => {
    preloadTabPages();
  }, []);

  // Count the open workflow tasks waiting for the user.
  const tasksCount = useMyTasksCount();

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

  // Count batches still awaiting the reviewer's response. The status filter is
  // applied to the effective status, so a batch past its deadline is left out
  // even before the expiry task has marked it.
  const { data: assignmentsCount = 0 } = useQuery({
    queryKey: ['my-assignments-pending-count'],
    queryFn: async () => {
      const response = await myAssignmentBatchesList({
        query: { status: ['sent'] },
      });
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

  // Count the evaluator roles held on proposals (a rapporteur, say).
  const { data: evaluatorRolesCount = 0 } = useQuery({
    queryKey: ['my-evaluator-roles-count', user?.uuid],
    queryFn: async () => {
      const response = await proposalRoleAssignmentsList({
        query: { user_uuid: user?.uuid, is_active: true, page_size: 1 },
      });
      return fetchResultCount(response);
    },
    enabled: !!user?.uuid,
  });

  // Whether the user was ever invited to a reviewer pool, whatever the answer.
  const { data: poolInvitationsCount = 0 } = useQuery({
    queryKey: ['my-pool-invitations-any-count', user?.uuid],
    queryFn: async () => {
      const response = await callReviewerPoolsList({
        query: { my_invitations: true, page_size: 1 },
      });
      return fetchResultCount(response);
    },
    enabled: !!user?.uuid,
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

  return useMemo(() => {
    // A reviewer's tabs for someone who reviews; an evaluator role's for
    // someone who holds one. An applicant keeps Tasks alone. The open page's
    // tab stays, so a link to it never loses its place.
    const reviews =
      hasReviewerRole(user) ||
      reviewsCount > 0 ||
      assignmentsCount > 0 ||
      poolInvitationsCount > 0;
    const shown = {
      tasks: true,
      reviews,
      assignments: reviews,
      invitations: reviews,
      'evaluator-roles': evaluatorRolesCount > 0,
      calls: reviews,
    };
    const tabs: TableTab[] = [
      {
        key: 'tasks',
        title: translate('Tasks'),
        count: tally(tasksCount),
        countLabel: translate('{count} waiting for you', { count: tasksCount }),
        state: 'reviews-tasks',
      },
      {
        key: 'reviews',
        title: translate('Reviews'),
        count: tally(reviewsCount),
        state: 'reviews-all-reviews',
      },
      {
        key: 'assignments',
        title: translate('Assignments'),
        count: tally(assignmentsCount),
        countLabel: translate('{count} waiting for you', {
          count: assignmentsCount,
        }),
        state: 'reviews-assignments',
      },
      {
        key: 'invitations',
        title: translate('Invitations'),
        count: tally(invitationsCount),
        state: 'reviews-invitations',
      },
      {
        key: 'evaluator-roles',
        title: translate('Evaluator roles'),
        count: tally(evaluatorRolesCount),
        state: 'reviews-evaluator-roles',
      },
      {
        key: 'calls',
        title: translate('Calls'),
        count: tally(callsCount),
        state: 'reviews-calls',
      },
    ];
    return tabs.filter((tab) => shown[tab.key] || tab.state === state.name);
  }, [
    user,
    state.name,
    poolInvitationsCount,
    tasksCount,
    reviewsCount,
    assignmentsCount,
    invitationsCount,
    evaluatorRolesCount,
    callsCount,
  ]);
};
