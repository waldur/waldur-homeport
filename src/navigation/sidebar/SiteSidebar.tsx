import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { getUser } from '@waldur/workspace/selectors';

import { MenuItem } from './MenuItem';
import { MenuSection } from './MenuSection';
import { ResourcesMenu } from './ResourcesMenu';
import { Sidebar } from './Sidebar';

export const SiteSidebar = () => {
  const user = useSelector(getUser);

  return (
    <Sidebar>
      {user ? (
        <>
          <ResourcesMenu anonymous={true} />
          <MenuSection title={translate('Management')} />
          <MenuItem
            title={translate('Organization')}
            state="profile.no-customer"
          />
          <MenuItem title={translate('Project')} state="profile.no-project" />
        </>
      ) : (
        <>
          <MenuItem title={translate('Login')} state="login" />
        </>
      )}
    </Sidebar>
  );
};
