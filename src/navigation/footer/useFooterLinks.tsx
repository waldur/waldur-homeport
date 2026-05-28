import { GlobeSimpleIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useMediaQuery } from 'react-responsive';

import * as AuthService from '@/auth/AuthService';
// eslint-disable-next-line waldur-custom/no-direct-client-usage
import { count } from '@/core/api';
import { ENV } from '@/core/config';
import { GRID_BREAKPOINTS, SHORT_STALE_TIME } from '@/core/constants';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { useUser } from '@/workspace/hooks';
import { checkHasNonProjectPermissions } from '@/workspace/selectors';

export const useFooterLinks = () => {
  const user = useUser();
  const isMd = useMediaQuery({ maxWidth: GRID_BREAKPOINTS.md });
  const hasNonProjectPerms = useMemo(
    () => checkHasNonProjectPermissions(user),
    [user],
  );

  // Fetch count for the "Join public organization" link
  const { data: publicInvitesCount } = useQuery({
    queryKey: ['publicGroupInvitationsCount'],
    queryFn: () =>
      count('/api/user-group-invitations/', {
        is_public: true,
        is_active: true,
      }),
    // On desktop, we only show organization links if user is logged in
    // On mobile/login page, we check the public invitations count
    staleTime: SHORT_STALE_TIME,
  });

  const config = useMemo(() => {
    const isAuth = AuthService.isAuthenticated();

    // 1. Permission Flags
    const showCalls = isFeatureVisible(
      MarketplaceFeatures.show_call_management_functionality,
    );

    const hideMarketplace = isFeatureVisible(
      MarketplaceFeatures.hide_marketplace_from_end_users,
    );
    const showMarketplace =
      ENV.plugins.WALDUR_CORE.ANONYMOUS_USER_CAN_VIEW_OFFERINGS &&
      (!hideMarketplace || user?.is_staff);

    const hideOrgInfo = isFeatureVisible(
      MarketplaceFeatures.hide_organization_information_from_project_members,
    );
    const canAccessOrg = !hideOrgInfo || hasNonProjectPerms;

    // 2. Specialized Logic for "Join Organization"
    // Requirement: Show based on invite count on mobile, or user perms on desktop
    const showJoinOrg =
      publicInvitesCount > 0 && (isMd || (!!user && canAccessOrg));

    const joinOrgItem = showJoinOrg
      ? {
          id: 'join-org',
          state: 'public.join-organization',
          label: isMd
            ? translate('Join public organization')
            : translate('Join organization'),
          icon: isMd ? undefined : <GlobeSimpleIcon size={20} weight="bold" />,
        }
      : null;

    // 3. Dynamic Links Array
    const dynamic = [
      // Calls for proposals
      showCalls &&
        (!isAuth || isMd) && {
          id: 'calls',
          label: translate('Calls for proposals'),
          state: 'calls-for-proposals-dashboard',
        },
      // Marketplace Landing
      showMarketplace &&
        (!isAuth || isMd) && {
          id: 'explore',
          label: translate('Explore marketplace'),
          state: 'public.marketplace-landing',
        },
      // Join Org (defined above)
      joinOrgItem,
    ].filter(Boolean);

    // 4. Constant Links
    return {
      dynamic,
      privacy: {
        id: 'privacy',
        label: translate('Privacy policy'),
        state: 'about.privacy',
      },
      tos: {
        id: 'tos',
        label: translate('Terms of service'),
        state: 'about.tos',
      },
    };
  }, [user, isMd, hasNonProjectPerms, publicInvitesCount]);

  return {
    isMd,
    config,
  };
};
