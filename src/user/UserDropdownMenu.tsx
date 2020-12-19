import { useMemo, FunctionComponent } from 'react';
import {
  Dropdown,
  DropdownMenu,
  DropdownToggle,
  MenuItem,
} from 'react-bootstrap';
import Gravatar from 'react-gravatar';
import { useSelector } from 'react-redux';

import { AuthService } from '@waldur/auth/AuthService';
import { $state } from '@waldur/core/services';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';
import { getUser } from '@waldur/workspace/selectors';

import { getPrivateUserTabs } from './constants';

const getSidebarItems = () =>
  getPrivateUserTabs()
    .filter((item) => isFeatureVisible(item.feature))
    .map((item) => ({ ...item, href: $state.href(item.state) }));

export const UserDropdownMenu: FunctionComponent = () => {
  const user = useSelector(getUser);
  const menuItems = useMemo(getSidebarItems, []);
  if (!user) {
    return null;
  }
  return (
    <li className="nav-header">
      <Dropdown id="user-sidebar" className="profile-element">
        <Gravatar email={user.email} className="img-circle" size={48} />
        <DropdownToggle useAnchor noCaret>
          <span className="block m-t-xs">
            {user.full_name || translate('User profile')}
          </span>
          <span className="text-muted text-xs block">
            {user.job_title || translate('Details')}
            <b className="caret"></b>
          </span>
        </DropdownToggle>
        <DropdownMenu className="m-t-xs">
          {menuItems.map((item, index) => (
            <MenuItem key={index} href={item.href}>
              {item.label}
            </MenuItem>
          ))}
          <MenuItem divider />
          <MenuItem onClick={AuthService.logout}>
            {translate('Log out')}
          </MenuItem>
        </DropdownMenu>
      </Dropdown>
    </li>
  );
};
