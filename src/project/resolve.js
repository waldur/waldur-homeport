import { getById } from '@waldur/core/api';
import { CustomersService } from '@waldur/customer/services/CustomersService';
import { ProjectPermissionsService } from '@waldur/customer/services/ProjectPermissionsService';
import { WOKSPACE_NAMES } from '@waldur/navigation/workspace/constants';
import store from '@waldur/store/store';
import { UsersService } from '@waldur/user/UsersService';
import {
  setCurrentCustomer,
  setCurrentProject,
} from '@waldur/workspace/actions';

// @ngInject
export function loadProject($state, $stateParams, WorkspaceService) {
  if (!$stateParams.uuid) {
    return $state.go('errorPage.notFound');
  }

  async function loadData() {
    try {
      const user = await UsersService.getCurrentUser();
      const project = await getById('/projects/', $stateParams.uuid);
      const customer = await CustomersService.get(project.customer_uuid);
      const permissions = await ProjectPermissionsService.getList({
        user: user.uuid,
        project: project.uuid,
      });
      project.permissions = permissions;
      store.dispatch(setCurrentCustomer(customer));
      store.dispatch(setCurrentProject(project));
      WorkspaceService.setWorkspace({
        customer,
        project,
        hasCustomer: true,
        workspace: WOKSPACE_NAMES.project,
      });
    } catch (response) {
      if (response.status === 404) {
        $state.go('errorPage.notFound');
      }
    }
  }
  return loadData();
}
