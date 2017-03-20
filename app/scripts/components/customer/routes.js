// @ngInject
function loadCustomer($q, $stateParams, $state, customersService, currentStateService, WorkspaceService) {
  if (!$stateParams.uuid) {
    return $q.reject();
  }
  return customersService.$get($stateParams.uuid)
    .then(customer => {
      currentStateService.setCustomer(customer);
      return customer;
    }).then(customer => {
      WorkspaceService.setWorkspace({
        customer: customer,
        project: null,
        hasCustomer: true,
        workspace: 'organization',
      });
      return customer;
    }).catch(error => {
      if (error.status === 404) {
        $state.go('errorPage.notFound');
      }
    });
}

// @ngInject
function CustomerController($scope, $state, usersService, currentStateService, customersService) {
  usersService.getCurrentUser().then(currentUser => {
    currentStateService.getCustomer().then(currentCustomer => {
      $scope.currentCustomer = currentCustomer;
      $scope.currentUser = currentUser;

      if (customersService.checkCustomerUser(currentCustomer, currentUser) || currentUser.is_support) {
        currentStateService.setOwnerOrStaff(true);
      } else {
        currentStateService.setOwnerOrStaff(false);
        $state.go('profile.details');
      }
    });
  });
}

// @ngInject
export default function organizationRoutes($stateProvider) {
  $stateProvider
    .state('organization', {
      url: '/organizations/:uuid/',
      abstract: true,
      data: {
        auth: true,
        workspace: 'organization'
      },
      template: '<customer-workspace><ui-view></ui-view></customer-workspace>',
      resolve: {
        currentCustomer: loadCustomer,
      },
      controller: CustomerController
    })

    .state('organization.dashboard', {
      url: 'dashboard/',
      template: '<organization-dashboard customer="currentCustomer"></organization-dashboard>',
      data: {
        pageTitle: gettext('Dashboard'),
        pageClass: 'gray-bg',
      }
    })

    .state('organization.details', {
      url: 'events/',
      template: '<customer-events customer="currentCustomer"></customer-events>',
      data: {
        pageTitle: gettext('Audit logs')
      }
    })

    .state('organization.issues', {
      url: 'issues/',
      template: '<customer-issues></customer-issues>',
      data: {
        pageTitle: gettext('Issues')
      }
    })

    .state('organization.alerts', {
      url: 'alerts/',
      template: '<customer-alerts/>',
      data: {
        pageTitle: gettext('Alerts')
      }
    })

    .state('organization.projects', {
      url: 'projects/',
      template: '<projects-list></projects-list>',
      data: {
        pageTitle: gettext('Projects')
      }
    })

    .state('organization.team', {
      url: 'team/',
      template: '<customer-team></customer-team>',
      data: {
        pageTitle: gettext('Team')
      }
    })

    .state('organization.providers', {
      url: 'providers/?providerUuid&providerType',
      template: '<providers-list/>',
      data: {
        pageTitle: gettext('Providers')
      }
    })

    .state('organization.sizing', {
      url: 'sizing/',
      template: '<cost-plans-list/>',
      data: {
        pageTitle: gettext('Cost planning')
      }
    })

    .state('organization.delete', {
      url: 'delete/',
      template: '<customer-delete></customer-delete>',
      data: {
        pageTitle: gettext('Delete organization')
      }
    })

    .state('organization.plans', {
      url: 'plans/',
      template: '<plans-list/>',
      data: {
        pageTitle: gettext('Plans')
      }
    })

    .state('organization.createProject', {
      url: 'createProject/',
      template: '<project-create></project-create>',
      data: {
        pageTitle: gettext('Create project'),
      }
    })

    .state('organization.createProvider', {
      url: 'createProvider/',
      template: '<provider-create></provider-create>',
      data: {
        pageTitle: gettext('Create provider')
      }
    });
}
