import { useQuery } from '@tanstack/react-query';
import { chatThreadsList, ThreadSession } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { useUser } from '@waldur/workspace/hooks';

interface UseThreadListOptions {
  enabled?: boolean;
  searchQuery?: string;
  isArchived?: boolean;
}

export const THREAD_LIST_QUERY_KEY = 'aiAssistantThreadList';

export const useThreadList = ({
  enabled = true,
  searchQuery,
  isArchived = false,
}: UseThreadListOptions = {}) => {
  const user = useUser();
  return useQuery<ThreadSession[]>({
    queryKey: [THREAD_LIST_QUERY_KEY, user?.uuid, isArchived, searchQuery],
    queryFn: async () => {
      const response = await chatThreadsList({
        query: {
          is_archived: isArchived,
          o: ['-created'],
          page_size: 100,
          ...(searchQuery ? { query: searchQuery } : {}),
        },
      });
      if (response.error) return [];
      return response.data ?? [];
    },
    enabled,
    staleTime: 30_000,
  });
};

/**
 * Group threads by time bucket for sidebar display.
 */
export const groupThreadsByDate = (
  threads: ThreadSession[],
): { label: string; threads: ThreadSession[] }[] => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(todayStart.getTime() - 30 * 24 * 60 * 60 * 1000);

  const today: ThreadSession[] = [];
  const lastWeek: ThreadSession[] = [];
  const lastMonth: ThreadSession[] = [];
  const older: ThreadSession[] = [];

  for (const thread of threads) {
    const created = new Date(thread.created ?? 0);
    if (created >= todayStart) {
      today.push(thread);
    } else if (created >= weekAgo) {
      lastWeek.push(thread);
    } else if (created >= monthAgo) {
      lastMonth.push(thread);
    } else {
      older.push(thread);
    }
  }

  const groups: { label: string; threads: ThreadSession[] }[] = [];
  if (today.length > 0)
    groups.push({ label: translate('Today'), threads: today });
  if (lastWeek.length > 0)
    groups.push({ label: translate('Previous 7 days'), threads: lastWeek });
  if (lastMonth.length > 0)
    groups.push({ label: translate('Previous 30 days'), threads: lastMonth });
  if (older.length > 0)
    groups.push({ label: translate('Older'), threads: older });

  return groups;
};
