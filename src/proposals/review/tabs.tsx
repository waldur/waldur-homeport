import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import { useEffect, useMemo } from 'react';
import {
  callReviewerPoolsList,
  myAssignmentBatchesList,
  proposalReviewsList,
  proposalRoleAssignmentsList,
  proposalStepDiscussionsList,
} from 'waldur-js-client';

import { fetchResultCount } from '@/core/api';
import { translate } from '@/i18n';
import { isMatrixChatEnabled } from '@/matrix/utils';
import {
  MY_DISCUSSIONS_KEY,
  useStartableDiscussions,
} from '@/proposals/discussions/queries';
import { TableTab } from '@/table/types';
import { useUser } from '@/workspace/hooks';

import { isReviewer } from './myWorkTitle';
import { preloadTabPages } from './tabPreload';
import { useMyTasksCount } from './useMyTasksCount';

/**
 * A tally after a tab title; zero shows none. Neutral, like the call state
 * tabs: a colour per tab reads as a status, which a count is not.
 */
const tally = (count: number) => count || undefined;

/**
 * Whether the user does review work: holds a reviewer or panel member role
 * on a call, or has reviews, assignments or reviewer pool invitations -- an
 * invitee holds no role until they accept, and accepting needs the reviewer
 * profile this tells them to create. The My reviews tabs and the header
 * above them both go by it; its counts are the tabs' tallies.
 */
export const useReviewingStanding = () => {
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

  return {
    reviewsCount,
    assignmentsCount,
    reviewing:
      isReviewer(user) ||
      reviewsCount > 0 ||
      assignmentsCount > 0 ||
      poolInvitationsCount > 0,
  };
};

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
  const { reviewsCount, assignmentsCount, reviewing } = useReviewingStanding();

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

  // The discussions the user takes part in: any, for the tab (a closed one's
  // record stays reachable), and the open ones for its tally, with those they
  // could start. The two counts are asked side by side, not one after the
  // other; the startable list is shared with the Discussions page's. None
  // without Matrix chat.
  const chatEnabled = isMatrixChatEnabled();
  const { data: discussionsCount = 0 } = useQuery({
    queryKey: [...MY_DISCUSSIONS_KEY, 'count', user?.uuid],
    queryFn: async () => {
      const response = await proposalStepDiscussionsList({
        query: { mine: true, page_size: 1 },
      });
      return fetchResultCount(response);
    },
    enabled: !!user?.uuid && chatEnabled,
  });
  const { data: openDiscussionsCount = 0 } = useQuery({
    queryKey: [...MY_DISCUSSIONS_KEY, 'open-count', user?.uuid],
    queryFn: async () => {
      const response = await proposalStepDiscussionsList({
        query: { mine: true, state: 'open', page_size: 1 },
      });
      return fetchResultCount(response);
    },
    enabled: !!user?.uuid && chatEnabled,
  });
  // Those waiting for the user to start them count too: before anyone has
  // started one, they are what the tab is there for.
  const { data: startable } = useStartableDiscussions(user?.uuid, chatEnabled);
  const startableCount = startable?.length ?? 0;

  return useMemo(() => {
    // A reviewer's tabs for someone who reviews; an evaluator role's for
    // someone who holds one. An applicant keeps Tasks alone. The open page's
    // tab stays, so a link to it never loses its place.
    const reviews = reviewing;
    const shown = {
      tasks: true,
      reviews,
      assignments: reviews,
      invitations: reviews,
      'evaluator-roles': evaluatorRolesCount > 0,
      calls: reviews,
      discussions: chatEnabled && (discussionsCount > 0 || startableCount > 0),
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
      {
        key: 'discussions',
        title: translate('Discussions'),
        count: tally(openDiscussionsCount + startableCount),
        countLabel: startableCount
          ? translate('{open} open, {startable} to start', {
              open: openDiscussionsCount,
              startable: startableCount,
            })
          : translate('{count} open', { count: openDiscussionsCount }),
        state: 'reviews-discussions',
      },
    ];
    return tabs.filter((tab) => shown[tab.key] || tab.state === state.name);
  }, [
    state.name,
    reviewing,
    tasksCount,
    reviewsCount,
    assignmentsCount,
    invitationsCount,
    evaluatorRolesCount,
    callsCount,
    chatEnabled,
    discussionsCount,
    openDiscussionsCount,
    startableCount,
  ]);
};
