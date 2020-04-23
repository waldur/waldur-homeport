import { WOKSPACE_NAMES } from '@waldur/navigation/workspace/constants';

// @ngInject
export function loadProject(
  $state,
  $stateParams,
  currentStateService,
  projectsService,
  projectPermissionsService,
  customersService,
  WorkspaceService,
  usersService,
) {
  if (!$stateParams.uuid) {
    return $state.go('errorPage.notFound');
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
    } catch (response) {
      if (response.status === 404) {
        $state.go('errorPage.notFound');
      }
    }
  }
  return loadData();
}
