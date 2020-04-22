import { WOKSPACE_NAMES } from '@waldur/navigation/workspace/constants';

// @ngInject
export function loadResource(
  $stateParams,
  $q,
  $state,
  currentStateService,
  resourcesService,
  projectsService,
  customersService,
  WorkspaceService,
) {
  if (!$stateParams.uuid) {
    return $q.reject();
  }

  return resourcesService
    .$get($stateParams.resource_type, $stateParams.uuid)
    .then(resource => {
      return projectsService.$get(resource.project_uuid).then(project => {
        return { project };
      });
    })
    .then(({ project }) => {
      return customersService.$get(project.customer_uuid).then(customer => {
        currentStateService.setCustomer(customer);
        currentStateService.setProject(project);
        return { customer, project };
      });
    })
    .then(({ customer, project }) => {
      WorkspaceService.setWorkspace({
        customer: customer,
        project: project,
        hasCustomer: true,
        workspace: WOKSPACE_NAMES.project,
      });
    })
    .catch(response => {
      if (response.status === 404) {
        $state.go('errorPage.notFound');
      }
    });
}

// @ngInject
export function ResourceController(
  $scope,
  usersService,
  currentStateService,
  customersService,
) {
  usersService.getCurrentUser().then(currentUser => {
    currentStateService.getCustomer().then(currentCustomer => {
      const status = customersService.checkCustomerUser(
        currentCustomer,
        currentUser,
      );
      currentStateService.setOwnerOrStaff(status);
    });
  });
}
