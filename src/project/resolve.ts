import { getById } from '@waldur/core/api';
import { $state } from '@waldur/core/services';
import { CustomersService } from '@waldur/customer/services/CustomersService';
import { ProjectPermissionsService } from '@waldur/customer/services/ProjectPermissionsService';
import store from '@waldur/store/store';
import { UsersService } from '@waldur/user/UsersService';
import {
  setCurrentCustomer,
  setCurrentProject,
  setCurrentWorkspace,
} from '@waldur/workspace/actions';
import { PROJECT_WORKSPACE, Project } from '@waldur/workspace/types';

export function loadProject($stateParams) {
  if (!$stateParams.uuid) {
    return $state.go('errorPage.notFound');
  }

  async function loadData() {
    try {
      const user = await UsersService.getCurrentUser();
      const project = await getById<Project>('/projects/', $stateParams.uuid);
      const customer = await CustomersService.get(project.customer_uuid);
      const permissions = await ProjectPermissionsService.getList({
        user: user.uuid,
        project: project.uuid,
      });
      project.permissions = permissions;
      store.dispatch(setCurrentCustomer(customer));
      store.dispatch(setCurrentProject(project));
      store.dispatch(setCurrentWorkspace(PROJECT_WORKSPACE));
    } catch (response) {
      if (response.status === 404) {
        $state.go('errorPage.notFound');
      }
    }
  }
  return loadData();
}

loadProject.$inject = ['$stateParams'];
