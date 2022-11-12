import { FunctionComponent } from 'react';
import { useEffectOnce } from 'react-use';

import { getFirst } from '@waldur/core/api';
import { Layout } from '@waldur/navigation/Layout';
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
  getUser as getUserSelector,
} from '@waldur/workspace/selectors';
import { Permission, USER_WORKSPACE } from '@waldur/workspace/types';

import { UsersService } from './UsersService';

export async function loadUser() {
  const currentProject = getProjectSelector(store.getState());
  const currentUser = getUserSelector(store.getState());
  if (
    router.globals.params.uuid === undefined ||
    router.globals.params.uuid === currentUser.uuid
  ) {
    store.dispatch(setCurrentWorkspace(USER_WORKSPACE));
    store.dispatch(setCurrentUser(currentUser));
  } else if (currentUser.is_staff || currentUser.is_support) {
    try {
      const user = await UsersService.get(router.globals.params.uuid);
      store.dispatch(setCurrentUser(user));
      store.dispatch(setCurrentWorkspace(USER_WORKSPACE));
    } catch (error) {
      if (error.response?.status === 404) {
        router.stateService.go('errorPage.notFound');
      }
    }
  } else {
    router.stateService.go('errorPage.notFound');
  }
  if (!currentProject) {
    const projectPermission = await getFirst<Permission>(
      '/project-permissions/',
    );
    if (projectPermission) {
      const newProject = await getProject(projectPermission.project_uuid);
      store.dispatch(setCurrentProject(newProject));
      const newCustomer = await getCustomer(newProject.customer_uuid);
      store.dispatch(setCurrentCustomer(newCustomer));
    }
  }
}

export const UserDetails: FunctionComponent = () => {
  useEffectOnce(() => {
    loadUser();
  });

  return <Layout />;
};
