import { WOKSPACE_NAMES } from '../navigation/workspace/constants';

import template from './project-base.html';

// @ngInject
function projectController(
  $scope,
  usersService,
  currentStateService,
  $stateParams,
  $state,
  projectsService,
  projectPermissionsService,
  customersService,
  WorkspaceService,
) {
  if (!$stateParams.uuid) {
    $state.go('errorPage.notFound');
    return;
  }

  async function loadData() {
    try {
      const user = await usersService.getCurrentUser();
      const project = await projectsService.$get($stateParams.uuid);
      const customer = await customersService.$get(project.customer_uuid);
      const permissions = await projectPermissionsService.getList({
        user: user.uuid,
        project: project.uuid,
      });
      project.permissions = permissions;
      currentStateService.setCustomer(customer);
      currentStateService.setProject(project);
      WorkspaceService.setWorkspace({
        customer,
        project,
        hasCustomer: true,
        workspace: WOKSPACE_NAMES.project,
      });
      const status = customersService.checkCustomerUser(customer, user);
      currentStateService.setOwnerOrStaff(status);
      $scope.currentProject = project;
    } catch (response) {
      if (response.status === 404) {
        $state.go('errorPage.notFound');
      }
    }
  }

  loadData();
}

export default () => ({
  template,
  controller: projectController,
});
