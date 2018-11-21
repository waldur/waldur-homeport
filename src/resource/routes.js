import { WOKSPACE_NAMES } from '../navigation/workspace/constants';

// @ngInject
function loadResource(
  $stateParams, $q, $state, currentStateService, resourcesService, projectsService, customersService, WorkspaceService) {
  if (!$stateParams.uuid) {
    return $q.reject();
  }

  return resourcesService.$get($stateParams.resource_type, $stateParams.uuid)
  .then(resource => {
    return projectsService.$get(resource.project_uuid).then(project => {
      return { project };
    });
  }).then(({ project }) => {
    return customersService.$get(project.customer_uuid).then(customer => {
      currentStateService.setCustomer(customer);
      currentStateService.setProject(project);
      return { customer, project };
    });
  }).then(({ customer, project }) => {
    WorkspaceService.setWorkspace({
      customer: customer,
      project: project,
      hasCustomer: true,
      workspace: WOKSPACE_NAMES.project,
    });
  }).catch(response => {
    if (response.status === 404) {
      $state.go('errorPage.notFound');
    }
  });
}

// @ngInject
function ResourceController($scope, usersService, currentStateService, customersService) {
  usersService.getCurrentUser().then(currentUser => {
    currentStateService.getCustomer().then(currentCustomer => {
      const status = customersService.checkCustomerUser(currentCustomer, currentUser);
      currentStateService.setOwnerOrStaff(status);
    });
  });
}

// @ngInject
export default function resourceRoutes($stateProvider) {
  $stateProvider
    .state('resources', {
      url: '/resources/',
      abstract: true,
      template: '<ui-view></ui-view>',
      data: {
        auth: true,
        workspace: WOKSPACE_NAMES.project,
        sidebarState: 'project.resources',
        pageClass: 'gray-bg'
      }
    })

    .state('resources.details', {
      url: ':resource_type/:uuid/:tab',
      template: '<resource-header></resource-header>',
      resolve: {
        resource: loadResource
      },
      controller: ResourceController
    });
}
