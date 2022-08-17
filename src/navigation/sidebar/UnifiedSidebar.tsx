import { useCurrentStateAndParams } from '@uirouter/react';
import { useEffect, useMemo } from 'react';

import { getCustomerItems } from '@waldur/customer/utils';
import { MenuComponent } from '@waldur/metronic/assets/ts/components';
import { DocsLink } from '@waldur/navigation/header/DocsLink';

import { getProjectItems, getProviderItems } from '../navitems';

import { AdminMenu } from './AdminMenu';
import { ManagementMenu } from './ManagementMenu';
import { MarketplaceTrigger } from './marketplace-popup/MarketplaceTrigger';
import { ReportingMenu } from './ReportingMenu';
import { ResourcesMenu } from './ResourcesMenu';
import { Sidebar } from './Sidebar';
import { SupportMenu } from './SupportMenu';

export const UnifiedSidebar = () => {
  const { state } = useCurrentStateAndParams();
  const managementItems = useMemo(() => {
    const menuItems = [
      ...getCustomerItems(),
      ...getProjectItems(),
      ...getProviderItems(),
    ];
    const states = [];
    for (const item of menuItems) {
      states.push(item.to);
    }
    return states;
  }, []);
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
    if (state.name === 'marketplace-project-resources') {
      const item = document.querySelector('#resources-menu');
      menu.show(item);
    }
    if (managementItems.includes(state.name)) {
      const item = document.querySelector('#management-menu');
      menu.show(item);
    }
  }, [state, managementItems]);
  return (
    <Sidebar>
      <MarketplaceTrigger />
      <ResourcesMenu />
      <ManagementMenu />
      <ReportingMenu />
      <SupportMenu />
      <AdminMenu />
      <DocsLink />
    </Sidebar>
  );
};
