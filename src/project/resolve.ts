import { Transition } from '@uirouter/react';

import { ProjectPermissionsService } from '@waldur/customer/services/ProjectPermissionsService';
import { router } from '@waldur/router';
import store from '@waldur/store/store';
import { UsersService } from '@waldur/user/UsersService';
import {
  setCurrentCustomer,
  setCurrentProject,
  setCurrentWorkspace,
} from '@waldur/workspace/actions';
import { PROJECT_WORKSPACE } from '@waldur/workspace/types';

import { getProject, getCustomer } from './api';

export function loadProject(transition: Transition) {
  if (!transition.params().uuid) {
    return router.stateService.go('errorPage.notFound');
  }

  async function loadData() {
    try {
      store.dispatch(setCurrentWorkspace(PROJECT_WORKSPACE));
      const user = await UsersService.getCurrentUser();
      const project = await getProject(transition.params().uuid);
      const customer = await getCustomer(project.customer_uuid);
      const permissions = await ProjectPermissionsService.getList({
        user: user.uuid,
        project: project.uuid,
      });
      project.permissions = permissions;
      store.dispatch(setCurrentCustomer(customer));
      store.dispatch(setCurrentProject(project));
    } catch (response) {
      if (response.status === 404) {
        router.stateService.go('errorPage.notFound');
      }
    }
  }
  return loadData();
}
