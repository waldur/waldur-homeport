import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { MenuComponent } from '@waldur/metronic/assets/ts/components';
import { getUser } from '@waldur/workspace/selectors';

import { AdminMenu } from './AdminMenu';
import { CallManagementMenu } from './CallManagementMenu';
import { ManagementMenu } from './ManagementMenu';
import { MarketplaceTrigger } from './marketplace-popup/MarketplaceTrigger';
import { MenuItem } from './MenuItem';
import { ProviderMenu } from './ProviderMenu';
import { ReportingMenu } from './ReportingMenu';
import { ResourcesMenu } from './ResourcesMenu';
import { Sidebar } from './Sidebar';
import { SupportMenu } from './SupportMenu';

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
      ].includes(state.name) ||
      params.resource_uuid
    ) {
      const item = document.querySelector('#resources-menu');
      menu.show(item);
    }
  }, [router, state, params.resource_uuid]);
  return (
    <Sidebar>
      {user ? (
        <>
          {user.is_staff || user.permissions?.length !== 0 ? (
            <MarketplaceTrigger />
          ) : null}
          <ManagementMenu />
          <ResourcesMenu />
          <ProviderMenu />
          <ReportingMenu />
          <SupportMenu />
          <AdminMenu />
          <CallManagementMenu />
        </>
      ) : (
        <MenuItem title={translate('Login')} state="login" />
      )}
    </Sidebar>
  );
};
