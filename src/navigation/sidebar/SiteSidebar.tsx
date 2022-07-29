import { translate } from '@waldur/i18n';

import { MenuItem } from './MenuItem';
import { MenuSection } from './MenuSection';
import { ResourcesMenu } from './ResourcesMenu';
import { Sidebar } from './Sidebar';

export const SiteSidebar = () => {
  return (
    <Sidebar>
      <ResourcesMenu anonymous={true} />
      <MenuSection title={translate('Management')} />
      <MenuItem title={translate('Organization')} state="profile.no-customer" />
      <MenuItem title={translate('Project')} state="profile.no-project" />
    </Sidebar>
  );
};
