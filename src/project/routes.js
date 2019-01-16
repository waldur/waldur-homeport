import { WOKSPACE_NAMES } from '../navigation/workspace/constants';

// @ngInject
function loadProject(
  $stateParams,
  $q,
  $state,
  usersService,
  currentStateService,
  projectsService,
  projectPermissionsService,
  customersService,
  WorkspaceService) {

  if (!$stateParams.uuid) {
    return $q.reject();
  }

  return usersService.getCurrentUser().then(user => {
    return projectsService.$get($stateParams.uuid).then(project => {
      return projectPermissionsService.getList({
        user: user.uuid,
        project: project.uuid,
      }).then(permissions => {
        project.permissions = permissions;
        return { project };
      });
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
    return project;
  }).catch(response => {
    if (response.status === 404) {
      $state.go('errorPage.notFound');
    }
  });
}

// @ngInject
function projectController($scope, usersService, currentStateService, customersService) {
  usersService.getCurrentUser().then(currentUser => {
    currentStateService.getCustomer().then(currentCustomer => {
      currentStateService.getProject().then(currentProject => {
        $scope.currentProject = currentProject;

        const status = customersService.checkCustomerUser(currentCustomer, currentUser);
        currentStateService.setOwnerOrStaff(status);
      });
    });
  });
}

// @ngInject
export default function projectRoutes($stateProvider) {
  $stateProvider
    .state('project', {
      url: '/projects/:uuid/',
      abstract: true,
      templateUrl: 'views/project/base.html',
      data: {
        auth: true,
        workspace: WOKSPACE_NAMES.project,
      },
      resolve: {
        currentProject: loadProject,
      },
      controller: projectController
    })

    .state('project.details', {
      url: '',
      template: '<project-dashboard project="currentProject"></project-dashboard>',
      data: {
        pageTitle: gettext('Dashboard'),
        pageClass: 'gray-bg',
        hideBreadcrumbs: true,
      }
    })

    .state('project.issues', {
      url: 'issues/',
      template: '<project-issues></project-issues>',
      data: {
        feature: 'support',
        pageTitle: gettext('Issues'),
        pageClass: 'gray-bg'
      }
    })

    .state('project.events', {
      url: 'events/',
      template: '<project-events project="currentProject"></project-events>',
      data: {
        pageTitle: gettext('Audit logs')
      }
    })

    .state('project.resources', {
      url: '',
      abstract: true,
      template: '<ui-view></ui-view>'
    })

    .state('project.resources.vms', {
      url: 'virtual-machines/',
      template: '<resource-vms-list></resource-vms-list>',
      data: {
        pageTitle: gettext('Virtual machines')
      }
    })

    .state('project.resources.clouds', {
      url: 'private-clouds/',
      template: '<resource-private-clouds-list></resource-private-clouds-list>',
      data: {
        pageTitle: gettext('Private clouds')
      }
    })

    .state('project.resources.storage', {
      url: 'storage/',
      template: '<ui-view></ui-view>',
      data: {
        pageTitle: gettext('Storage')
      },
      abstract: true
    })

    .state('project.resources.storage.tabs', {
      url: '',
      template: '<resource-storage-tabs></resource-storage-tabs>'
    })

    .state('project.team', {
      url: 'team/',
      template: '<project-team>',
      data: {
        pageTitle: gettext('Team')
      },
    })

    .state('project.cost-planning', {
      url: 'cost-planning/',
      template: '<cost-plans-list></cost-plans-list>',
      data: {
        pageTitle: gettext('Cost planning'),
        feature: 'cost-planning'
      }
    });
}
