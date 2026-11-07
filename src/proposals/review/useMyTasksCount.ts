import { useQuery } from '@tanstack/react-query';
import {
  MyTaskSummary,
  proposalMyTasksSummaryRetrieve,
} from 'waldur-js-client';

import { useUser } from '@/workspace/hooks';

// Kept as the key's prefix: invalidating it refreshes every count of tasks.
const MY_TASKS_COUNT_QUERY_KEY = 'my-tasks-count';

/**
 * How many workflow tasks wait for the current user, and how many of them
 * are overdue or due soon. Shared by the Tasks tab badge, the sidebar's My
 * reviews item and the dashboard's My work cards: one request for all, so
 * none of them can disagree with another.
 */
export const useMyTasksSummary = (): MyTaskSummary | undefined => {
  const user = useUser();
  const { data } = useQuery({
    queryKey: [MY_TASKS_COUNT_QUERY_KEY, user?.uuid],
    queryFn: async () => (await proposalMyTasksSummaryRetrieve()).data,
    enabled: !!user?.uuid,
    refetchOnWindowFocus: false,
  });
  return data;
};

/** How many workflow tasks wait for the current user. */
export const useMyTasksCount = (): number => useMyTasksSummary()?.total ?? 0;
