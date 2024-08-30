import { ShoppingCart } from '@phosphor-icons/react';
import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { MenuComponent } from '@waldur/metronic/components';
import { CallPublicMenu } from '@waldur/navigation/sidebar/CallPublicMenu';
import { getUser } from '@waldur/workspace/selectors';

import { MarketplaceTrigger } from './marketplace-popup/MarketplaceTrigger';
import { MenuItem } from './MenuItem';
import { OrganizationsListMenu } from './OrganizationsListMenu';
import { ProjectsListMenu } from './ProjectsListMenu';
import { ReportingMenu } from './ReportingMenu';
import { ResourcesMenu } from './ResourcesMenu';
import { Sidebar } from './Sidebar';

export const UnifiedSidebar = () => {
  const user = useSelector(getUser);
  const router = useRouter();
  const { state, params } = useCurrentStateAndParams();
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
        'public-call.details',
        'protected-call.main',
      ].includes(state.name)
    ) {
      const item = document.querySelector('#calls-menu');
      menu.show(item);
    }
  }, [router, state, params.resource_uuid]);

  if (!user) {
    return null;
  }
  return (
    <Sidebar>
      {user.is_staff || user.permissions?.length !== 0 ? (
        <MarketplaceTrigger />
      ) : null}
      <OrganizationsListMenu />
      <ProjectsListMenu />
      <ResourcesMenu user={user} />
      <ReportingMenu />
      <CallPublicMenu />
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
        icon={<ShoppingCart weight="bold" />}
        title={translate('Marketplace')}
        state="public.marketplace-landing"
        child={false}
      />
    </Sidebar>
  );
};
