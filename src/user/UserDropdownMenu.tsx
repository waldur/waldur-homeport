import * as React from 'react';
import * as Dropdown from 'react-bootstrap/lib/Dropdown';
import * as MenuItem from 'react-bootstrap/lib/MenuItem';
import * as Gravatar from 'react-gravatar';
import { useSelector } from 'react-redux';

import { ngInjector, $state } from '@waldur/core/services';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';
import { getUser } from '@waldur/workspace/selectors';

import { getPrivateUserTabs } from './constants';

const getSidebarItems = () =>
  getPrivateUserTabs()
    .filter(item => isFeatureVisible(item.feature))
    .map(item => ({ ...item, href: $state.href(item.state) }));

export const UserDropdownMenu = () => {
  const user = useSelector(getUser);
  const logout = () => ngInjector.get('authService').logout();
  const menuItems = React.useMemo(getSidebarItems, []);
  if (!user) {
    return null;
  }
  return (
    <li className="nav-header">
      <Dropdown id="user-sidebar" className="profile-element">
        <Gravatar email={user.email} className="img-circle" size={48} />
        <Dropdown.Toggle useAnchor noCaret>
          <span className="block m-t-xs">
            {user.full_name || translate('User profile')}
          </span>
          <span className="text-muted text-xs block">
            {user.job_title || translate('Details')}
            <b className="caret"></b>
          </span>
        </Dropdown.Toggle>
        <Dropdown.Menu className="m-t-xs">
          {menuItems.map((item, index) => (
            <MenuItem key={index} href={item.href}>
              {item.label}
            </MenuItem>
          ))}
          <MenuItem divider />
          <MenuItem onClick={logout}>{translate('Log out')}</MenuItem>
        </Dropdown.Menu>
      </Dropdown>
    </li>
  );
};
