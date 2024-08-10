import { UIView, useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { useEffectOnce } from 'react-use';

import { usePageHero } from '@waldur/navigation/context';
import { getProjectPermission } from '@waldur/permissions/utils';
import { getProject, getCustomer } from '@waldur/project/api';
import { router } from '@waldur/router';
import store from '@waldur/store/store';
import {
  setCurrentWorkspace,
  setCurrentUser,
  setCurrentProject,
  setCurrentCustomer,
} from '@waldur/workspace/actions';
import {
  getProject as getProjectSelector,
  getUser,
  getUser as getUserSelector,
} from '@waldur/workspace/selectors';
import {
  UserDetails as IUserDetails,
  WorkspaceType,
} from '@waldur/workspace/types';

import { UserProfileHero } from './dashboard/UserProfileHero';
import { UsersService } from './UsersService';

async function loadUser() {
  const currentProject = getProjectSelector(store.getState());
  const currentUser = getUserSelector(store.getState());
  if (
    router.globals.params.uuid === undefined ||
    router.globals.params.uuid === currentUser.uuid
  ) {
    store.dispatch(setCurrentWorkspace(WorkspaceType.USER));
    store.dispatch(setCurrentUser(currentUser));
  } else if (currentUser.is_staff || currentUser.is_support) {
    try {
      const user = await UsersService.get(router.globals.params.uuid);
      store.dispatch(setCurrentUser(user));
      store.dispatch(setCurrentWorkspace(WorkspaceType.USER));
    } catch (error) {
      if (error.response?.status === 404) {
        router.stateService.go('errorPage.notFound');
      }
    }
  } else {
    router.stateService.go('errorPage.notFound');
  }
  if (currentUser && !currentProject) {
    const projectPermission = getProjectPermission(currentUser);
    if (projectPermission) {
      const newProject = await getProject(projectPermission.scope_uuid);
      store.dispatch(setCurrentProject(newProject));
      const newCustomer = await getCustomer(newProject.customer_uuid);
      store.dispatch(setCurrentCustomer(newCustomer));
    }
  }
}

export const UserDetails: FunctionComponent = () => {
  const user = useSelector(getUser) as IUserDetails;
  const { state } = useCurrentStateAndParams();

  useEffectOnce(() => {
    loadUser();
  });

  usePageHero(<UserProfileHero user={user} isLoading={!user} />, [user, state]);

  return <UIView />;
};
