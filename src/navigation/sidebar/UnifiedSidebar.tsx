import { ShoppingCartIcon } from '@phosphor-icons/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import { useEffect, useMemo } from 'react';

import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { canUseMarketplaceShopUi } from '@/marketplace/canUseMarketplaceShopUi';
import {
  getServiceAccessMode,
  isMarketplaceVisible,
} from '@/marketplace/serviceAccessMode';
import { getMarketplaceTitle } from '@/marketplace/title';
import {
  CallPublicMenu,
  CallsModeEntries,
} from '@/navigation/sidebar/CallPublicMenu';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermissionOnAnyScope } from '@/permissions/hasPermission';
import { useProfileCompletenessContext } from '@/user/ProfileCompletenessContext';
import { useUser } from '@/workspace/hooks';
import { checkHasNonProjectPermissions } from '@/workspace/selectors';

import { ManagedOfferingsMenu } from './ManagedOfferingsMenu';
import { MarketplaceTrigger } from './marketplace-popup/MarketplaceTrigger';
import { MenuItem } from './MenuItem';
import { OrganizationsListMenu } from './OrganizationsListMenu';
import { ProjectsListMenu } from './ProjectsListMenu';
import { ReportingMenu } from './ReportingMenu';
import { ResourcesMenu } from './ResourcesMenu';
import { Sidebar } from './Sidebar';
import {
  getCallsSidebarItem,
  getSidebarSection,
  isCallManagementItem,
} from './sidebarSection';
import { useExclusiveOpen } from './utils';

export const UnifiedSidebar = () => {
  const user = useUser();
  const { state } = useCurrentStateAndParams();
  const { shouldBlockNavigation } = useProfileCompletenessContext();

  const disabledTooltip = shouldBlockNavigation
    ? translate('Please complete your profile to access this section')
    : undefined;

  const {
    openId: openTopId,
    setOpenId: setOpenTopId,
    toggle: toggleTop,
  } = useExclusiveOpen();

  // Auto-expand the sidebar section matching the current route, so a deep
  // link lands with the active item already visible — the Radix
  // replacement for the imperative menu JS
  // this used to make. Deliberately
  // a one-shot "open it" on route match, not a persistent binding: matches
  // the original's own behavior of never calling the equivalent of
  // `.hide()` for a route still inside the open section — it only reopens
  // on the next matching navigation, it doesn't force itself back open
  // while the user stays there.
  //
  // The section comes from the route's `sidebarSection`, which a page
  // inherits from the abstract root of its area, so every tab and detail
  // page under that root opens it — not only the pages someone listed.
  //
  // Leaving both sections entirely (Reporting, Marketplace, Projects,
  // Organizations, ...) collapses whichever accordion is open — otherwise
  // Resources/Calls stayed expanded forever after the first visit, wasting
  // space for every unrelated page visited afterward.
  //
  // In calls-only mode the Calls accordion holds only operators' entries; the
  // rest are top-level, so their pages leave it closed.
  const isCallsMode = getServiceAccessMode() === 'calls';
  const section = getSidebarSection(state);
  const opensSection =
    section === 'calls' && isCallsMode
      ? isCallManagementItem(getCallsSidebarItem(state))
      : Boolean(section);
  useEffect(() => {
    setOpenTopId(opensSection ? `${section}-menu` : undefined);
  }, [state.name, section, opensSection]);

  const hasNonProjectPerms = useMemo(
    () => checkHasNonProjectPermissions(user),
    [user],
  );

  if (!user) {
    return null;
  }
  const canAccessMarketplace = canUseMarketplaceShopUi(user);

  const canCreateOrder = hasPermissionOnAnyScope(
    user,
    PermissionEnum.CREATE_ORDER,
  );
  // Calls are the only way in: nobody adds a resource from the sidebar, staff
  // included -- they still reach the marketplace through its own routes.
  const showAddResource =
    canCreateOrder && canAccessMarketplace && isMarketplaceVisible();

  const canAccessOrganization =
    !isFeatureVisible(
      MarketplaceFeatures.hide_organization_information_from_project_members,
    ) || hasNonProjectPerms;

  // In marketplace-only mode the marketplace is the entry point, so it ends the
  // consumer run of the sidebar and the operator section sits below it. In the
  // other modes calls are part of what everyone browses, so they keep their
  // place in the middle.
  const isMarketplaceMode = getServiceAccessMode() === 'marketplace';
  const callMenu = (
    <CallPublicMenu
      disabled={shouldBlockNavigation}
      disabledTooltip={disabledTooltip}
      open={openTopId === 'calls-menu'}
      onOpenChange={toggleTop('calls-menu')}
    />
  );

  const organizationsMenu = canAccessOrganization && (
    <OrganizationsListMenu
      disabled={shouldBlockNavigation}
      disabledTooltip={disabledTooltip}
    />
  );
  const projectsMenu = (
    <ProjectsListMenu
      disabled={shouldBlockNavigation}
      disabledTooltip={disabledTooltip}
    />
  );
  const resourcesMenu = (
    <ResourcesMenu
      user={user}
      disabled={shouldBlockNavigation}
      disabledTooltip={disabledTooltip}
      open={openTopId === 'resources-menu'}
      onOpenChange={toggleTop('resources-menu')}
    />
  );
  const operatorMenus = (
    <>
      <ManagedOfferingsMenu
        user={user}
        disabled={shouldBlockNavigation}
        disabledTooltip={disabledTooltip}
        open={openTopId === 'offerings-menu'}
        onOpenChange={toggleTop('offerings-menu')}
      />
      <ReportingMenu
        disabled={shouldBlockNavigation}
        disabledTooltip={disabledTooltip}
      />
    </>
  );

  // Calls-only: calls are the way in, so the sidebar opens on them -- the
  // public list, then the user's own proposals and tasks -- followed by where
  // awarded allocations land, and the operator part last.
  if (isCallsMode) {
    return (
      <Sidebar>
        <CallsModeEntries
          disabled={shouldBlockNavigation}
          disabledTooltip={disabledTooltip}
        />
        {projectsMenu}
        {resourcesMenu}
        {organizationsMenu}
        {callMenu}
        {operatorMenus}
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      {showAddResource ? (
        <MarketplaceTrigger
          disabled={shouldBlockNavigation}
          disabledTooltip={disabledTooltip}
        />
      ) : null}
      {organizationsMenu}
      {projectsMenu}
      {resourcesMenu}
      {operatorMenus}
      {!isMarketplaceMode && callMenu}
      {canAccessMarketplace && isMarketplaceVisible() && (
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
          title={getMarketplaceTitle()}
          state="public.marketplace-landing"
          disabled={shouldBlockNavigation}
          disabledTooltip={disabledTooltip}
        />
      )}
      {isMarketplaceMode && callMenu}
    </Sidebar>
  );
};
