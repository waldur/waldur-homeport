import * as React from 'react';
import { useSelector } from 'react-redux';

import { ngInjector } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { Sidebar } from '@waldur/navigation/sidebar/Sidebar';
import { MenuItemType } from '@waldur/navigation/sidebar/types';
import { filterItems } from '@waldur/navigation/sidebar/utils';
import { getUser } from '@waldur/workspace/selectors';
import { OuterState } from '@waldur/workspace/types';

import { getPrivateUserTabs, getPublicUserTabs } from './constants';

function getNavItems(user) {
  const stateUtilsService = ngInjector.get('stateUtilsService');
  const currentStateService = ngInjector.get('currentStateService');

  const prevWorkspace = stateUtilsService.getPrevWorkspace();
  if (prevWorkspace === 'project') {
    return [
      {
        key: 'back',
        label: translate('Back to project'),
        icon: 'fa-arrow-left',
        action: stateUtilsService.goBack,
      },
    ];
  } else if (
    prevWorkspace === 'organization' &&
    (currentStateService.getOwnerOrStaff() || user.is_support)
  ) {
    return [
      {
        key: 'back',
        label: translate('Back to organization'),
        icon: 'fa-arrow-left',
        action: stateUtilsService.goBack,
      },
    ];
  }
  return [];
}

export const UserSidebar = () => {
  const [items, setItems] = React.useState<MenuItemType[]>([]);
  const workspaceUser = useSelector(
    (state: OuterState) => state.workspace?.user,
  );
  const currentUser = useSelector(getUser);

  React.useEffect(() => {
    if (!currentUser || !workspaceUser) {
      return;
    }
    if (currentUser.uuid === workspaceUser.uuid) {
      setItems(
        filterItems([...getNavItems(currentUser), ...getPrivateUserTabs()]),
      );
    } else {
      setItems(
        filterItems([
          ...getNavItems(currentUser),
          ...getPublicUserTabs(workspaceUser),
        ]),
      );
    }
  }, [currentUser, workspaceUser]);

  return <Sidebar items={items} />;
};
