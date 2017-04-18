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
        currentStateService.setProject(project);
        return { project };
      });
    });
  }).then(({ project }) => {
    return customersService.$get(project.customer_uuid).then(customer => {
      currentStateService.setCustomer(customer);
      return { customer, project };
    });
  }).then(({ customer, project }) => {
    WorkspaceService.setWorkspace({
      customer: customer,
      project: project,
      hasCustomer: true,
      workspace: 'project',
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
        workspace: 'project',
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
        pageTitle: gettext('Project dashboard'),
        pageClass: 'gray-bg'
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

    .state('project.alerts', {
      url: 'alerts/',
      template: '<project-alerts-list/>',
      data: {
        pageTitle: gettext('Alerts')
      }
    })

    .state('project.resources', {
      url: '',
      abstract: true,
      template: '<ui-view/>'
    })

    .state('project.resources.vms', {
      url: 'virtual-machines/',
      template: '<resource-vms-list/>',
      data: {
        pageTitle: gettext('Virtual machines')
      }
    })

    .state('project.resources.apps', {
      url: 'applications/',
      template: '<resource-applications-list/>',
      data: {
        pageTitle: gettext('Applications')
      }
    })

    .state('project.resources.clouds', {
      url: 'private-clouds/',
      template: '<resource-private-clouds-list/>',
      data: {
        pageTitle: gettext('Private clouds')
      }
    })

    .state('project.resources.storage', {
      url: 'storage/',
      template: '<ui-view/>',
      data: {
        pageTitle: gettext('Storage')
      },
      abstract: true
    })

    .state('project.resources.storage.tabs', {
      url: '',
      template: '<resource-storage-tabs/>'
    })

    .state('project.resources.offerings', {
      url: 'offerings/',
      template: '<project-offerings-list/>',
      data: {
        pageTitle: gettext('Requested Services'),
        feature: 'offering'
      }
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
      template: '<cost-plans-list/>',
      data: {
        pageTitle: gettext('Cost planning')
      }
    })

    .state('import', {
      url: 'import/',
      parent: 'project',
      template: '<ui-view></ui-view>',
      abstract: true,
      data: {
        auth: true,
        workspace: 'project',
        pageTitle: gettext('Import resources from provider')
      }
    })

    .state('import.import', {
      url: '?service_type&service_uuid',
      templateUrl: 'views/import/import.html',
    });
}
