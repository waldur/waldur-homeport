import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { externalLinksList } from 'waldur-js-client';

import { activeRoleNames, useAppShortcuts } from 'waldur-shell';

import { SHORTCUTS_QUERY_KEY } from '@/administration/quick-shortcuts/utils';
import { ENV } from '@/core/config';
import { useUser } from '@/workspace/hooks';

/**
 * What the quick shortcuts menu lists in the portal: the deployment's
 * micro-apps the user may see (micro-apps.json, behind the
 * user.show_micro_apps feature), then the staff-managed external links.
 * Shared by the sidebar's brand row and the mobile header, which shows the
 * menu while the sidebar is a drawer without that row.
 */
export const useQuickShortcuts = () => {
  const { data } = useQuery({
    queryKey: SHORTCUTS_QUERY_KEY,
    queryFn: () =>
      externalLinksList({ query: { page_size: 50 } }).then(
        (response) => response.data,
      ),
    refetchOnWindowFocus: false,
  });
  const links = data || [];

  const user = useUser();
  const viewer = useMemo(
    () =>
      user
        ? {
            isStaff: Boolean(user.is_staff),
            isSupport: Boolean(user.is_support),
            roleNames: activeRoleNames(user.permissions),
          }
        : null,
    [user],
  );
  const apps = useAppShortcuts({
    baseUrl: import.meta.env.BASE_URL,
    viewer,
    features: ENV.FEATURES,
  });

  return { apps, links };
};
