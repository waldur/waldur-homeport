import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { useAsync } from 'react-use';

import { SidebarExtensionService } from '@waldur/navigation/sidebar/SidebarExtensionService';
import { MenuItemType } from '@waldur/navigation/sidebar/types';
import { filterItems, mergeItems } from '@waldur/navigation/sidebar/utils';
import { RootState } from '@waldur/store/reducers';
import { getUser } from '@waldur/workspace/selectors';
import { USER_WORKSPACE } from '@waldur/workspace/types';

import { getPrivateUserTabs, getPublicUserTabs } from './constants';

const getExtraSidebarItems = (): Promise<MenuItemType[]> => {
  return SidebarExtensionService.getItems(USER_WORKSPACE);
};

export const UserSidebar: FunctionComponent = () => {
  const workspaceUser = useSelector(
    (state: RootState) => state.workspace?.user,
  );
  const currentUser = useSelector(getUser);

  useAsync(async () => {
    if (!currentUser || !workspaceUser) {
      return { items: [] };
    }
    const sidebarItems =
      currentUser.uuid === workspaceUser.uuid
        ? filterItems([...getPrivateUserTabs()])
        : filterItems([...getPublicUserTabs(workspaceUser)]);
    const extraItems = await getExtraSidebarItems();
    const items = mergeItems(sidebarItems, extraItems);
    return { items };
  }, [currentUser, workspaceUser]);

  return <div />;
};
