import * as React from 'react';
import { useSelector } from 'react-redux';

import { ngInjector } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { Sidebar } from '@waldur/navigation/sidebar/Sidebar';
import { MenuItemType } from '@waldur/navigation/sidebar/types';
import { filterItems } from '@waldur/navigation/sidebar/utils';
import store from '@waldur/store/store';
import {
  getCustomer,
  getProject,
  getUser,
  isOwnerOrStaff,
} from '@waldur/workspace/selectors';
import {
  OuterState,
  ORGANIZATION_WORKSPACE,
  PROJECT_WORKSPACE,
} from '@waldur/workspace/types';

import { getPrivateUserTabs, getPublicUserTabs } from './constants';

function getNavItems(user, customer, project) {
  const StateUtilsService = ngInjector.get('StateUtilsService');

  const prevWorkspace = StateUtilsService.getPrevWorkspace();
  if (prevWorkspace === PROJECT_WORKSPACE) {
    return [
      {
        key: 'back',
        label: translate('Back to project'),
        icon: 'fa-arrow-left',
        state: 'project.details',
        params: { uuid: project.uuid },
      },
    ];
  } else if (
    prevWorkspace === ORGANIZATION_WORKSPACE &&
    (isOwnerOrStaff(store.getState()) || user.is_support)
  ) {
    return [
      {
        key: 'back',
        label: translate('Back to organization'),
        icon: 'fa-arrow-left',
        state: 'organization.dashboard',
        params: { uuid: customer.uuid },
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
  const currentCustomer = useSelector(getCustomer);
  const currentProject = useSelector(getProject);

  React.useEffect(() => {
    if (!currentUser || !workspaceUser) {
      return;
    }
    if (currentUser.uuid === workspaceUser.uuid) {
      setItems(
        filterItems([
          ...getNavItems(currentUser, currentCustomer, currentProject),
          ...getPrivateUserTabs(),
        ]),
      );
    } else {
      setItems(
        filterItems([
          ...getNavItems(currentUser, currentCustomer, currentProject),
          ...getPublicUserTabs(workspaceUser),
        ]),
      );
    }
  }, [currentUser, workspaceUser]);

  return <Sidebar items={items} />;
};
