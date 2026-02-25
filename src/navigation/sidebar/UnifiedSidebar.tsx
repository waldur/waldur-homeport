import { ShoppingCartIcon } from '@phosphor-icons/react';
import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { MenuComponent } from '@waldur/metronic/components';
import { CallPublicMenu } from '@waldur/navigation/sidebar/CallPublicMenu';
import { useProfileCompletenessContext } from '@waldur/user/ProfileCompletenessContext';
import { useUser } from '@waldur/workspace/hooks';
import { hasNonProjectPermissions } from '@waldur/workspace/selectors';

import { MarketplaceTrigger } from './marketplace-popup/MarketplaceTrigger';
import { MenuItem } from './MenuItem';
import { OrganizationsListMenu } from './OrganizationsListMenu';
import { ProjectsListMenu } from './ProjectsListMenu';
import { ReportingMenu } from './ReportingMenu';
import { ResourcesMenu } from './ResourcesMenu';
import { Sidebar } from './Sidebar';

export const UnifiedSidebar = () => {
  const user = useUser();
  const router = useRouter();
  const { state, params } = useCurrentStateAndParams();
  const { shouldBlockNavigation } = useProfileCompletenessContext();

  const disabledTooltip = shouldBlockNavigation
    ? translate('Please complete your profile to access this section')
    : undefined;

  useEffect(() => {
    MenuComponent.reinitialization();
    const menuElement = document.querySelector('#kt_aside_menu');
    if (!menuElement) {
      return;
    }
    const menu = MenuComponent.getInstance(menuElement as HTMLElement);
    if (!menu) {
      return;
    }
    if (
      [
        'marketplace-project-resources-all',
        'marketplace-project-resources',
        'category-resources',
        'all-resources',
      ].includes(state.name) ||
      params.resource_uuid
    ) {
      const item = document.querySelector('#resources-menu');
      menu.show(item);
    }
    if (
      [
        'calls-for-proposals-dashboard',
        'proposals-all-proposals',
        'reviews-all-reviews',
        'reviews-invitations',
        'admin-proposals',
        'admin-reviews',
        'public-call.details',
        'protected-call.main',
      ].includes(state.name)
    ) {
      const item = document.querySelector('#calls-menu');
      menu.show(item);
    }
  }, [router, state, params.resource_uuid]);

  const hasNonProjectPerms = useSelector(hasNonProjectPermissions);

  if (!user) {
    return null;
  }
  const canAccessMarketplace =
    !isFeatureVisible(MarketplaceFeatures.hide_marketplace_from_end_users) ||
    user.is_staff;

  const canAccessOrganization =
    !isFeatureVisible(
      MarketplaceFeatures.hide_organization_information_from_project_members,
    ) || hasNonProjectPerms;

  return (
    <Sidebar>
      {canAccessMarketplace &&
      (user.is_staff || user.permissions?.length !== 0) ? (
        <MarketplaceTrigger
          disabled={shouldBlockNavigation}
          disabledTooltip={disabledTooltip}
        />
      ) : null}
      {canAccessOrganization && (
        <OrganizationsListMenu
          disabled={shouldBlockNavigation}
          disabledTooltip={disabledTooltip}
        />
      )}
      <ProjectsListMenu
        disabled={shouldBlockNavigation}
        disabledTooltip={disabledTooltip}
      />
      <ResourcesMenu
        user={user}
        disabled={shouldBlockNavigation}
        disabledTooltip={disabledTooltip}
      />
      <ReportingMenu
        disabled={shouldBlockNavigation}
        disabledTooltip={disabledTooltip}
      />
      <CallPublicMenu
        disabled={shouldBlockNavigation}
        disabledTooltip={disabledTooltip}
      />
      {canAccessMarketplace && (
        <MenuItem
          activeState={
            [
              'public.marketplace',
              'public-offering',
              'marketplace-orders.details',
            ].some((name) => state.name.startsWith(name))
              ? state.name
              : undefined
          }
          icon={<ShoppingCartIcon weight="bold" />}
          title={translate('Marketplace')}
          state="public.marketplace-landing"
          child={false}
          disabled={shouldBlockNavigation}
          disabledTooltip={disabledTooltip}
        />
      )}
    </Sidebar>
  );
};
