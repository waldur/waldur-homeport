// @ngInject
export default function organizationRoutes($stateProvider) {
  $stateProvider
    .state('dashboard', {
      url: '/dashboard/',
      abstract: true,
      template: '<customer-workspace><ui-view></ui-view></customer-workspace>',
      data: {
        pageTitle: 'Dashboard',
        pageClass: 'gray-bg',
        workspace: 'organization',
        auth: true
      },
    })

    .state('dashboard.index', {
      url: '?tab',
      templateUrl: 'views/dashboard/organization.html',
      controller: 'OrganizationDashboardController',
      controllerAs: 'DashboardCtrl',
      bindToController: true
    })

    .state('organization', {
      url: '/organizations/:uuid/',
      abstract: true,
      data: {
        auth: true,
        workspace: 'organization'
      },
      template: '<customer-workspace><ui-view></ui-view></customer-workspace>',
    })

    .state('organization.details', {
      url: '',
      template: '<customer-events customer="currentCustomer"></customer-events>',
      data: {
        pageTitle: 'Audit logs'
      }
    })

    .state('organization.issues', {
      url: 'issues/',
      template: '<customer-issues></customer-issues>',
      data: {
        pageTitle: 'Issues'
      }
    })

    .state('organization.alerts', {
      url: 'alerts/',
      templateUrl: 'views/partials/filtered-list.html',
      controller: 'CustomerAlertsListController',
      controllerAs: 'ListController',
      data: {
        pageTitle: 'Alerts'
      }
    })

    .state('organization.projects', {
      url: 'projects/',
      template: '<projects-list></projects-list>',
      data: {
        pageTitle: 'Projects'
      }
    })

    .state('organization.team', {
      url: 'team/',
      templateUrl: 'views/customer/tab-team.html',
      data: {
        pageTitle: 'Team'
      },
      abstract: true
    })

    .state('organization.team.tabs', {
      url: '',
      views: {
        users: {
          template: '<customer-users-list></customer-users-list>'
        },
        invitations: {
          template: '<invitations-list></invitations-list>'
        }
      }
    })

    .state('organization.providers', {
      url: 'providers/?providerUuid&providerType',
      templateUrl: 'views/partials/filtered-list.html',
      controller: 'ProviderListController',
      controllerAs: 'ListController',
      data: {
        pageTitle: 'Providers'
      }
    })

    .state('organization.billing', {
      url: 'billing/',
      templateUrl: 'views/customer/tab-billing.html',
      data: {
        pageTitle: 'Billing'
      },
      abstract: true
    })

    .state('organization.billing.tabs', {
      url: '',
      views: {
        invoices: {
          controller: 'InvoicesListController',
          controllerAs: 'ListController',
          templateUrl: 'views/partials/filtered-list.html'
        }
      }
    })

    .state('organization.invoiceDetails', {
      url: 'invoice/:invoiceUUID/',
      template: '<invoice-details></invoice-details>'
    })

    .state('organization.sizing', {
      url: 'sizing/',
      templateUrl: 'views/customer/tab-sizing.html',
      data: {
        pageTitle: 'Sizing'
      }
    })

    .state('organization.delete', {
      url: 'delete/',
      templateUrl: 'views/customer/tab-delete.html',
      controller: 'CustomerDeleteTabController',
      controllerAs: 'DeleteController',
      data: {
        pageTitle: 'Delete organization'
      }
    })

    .state('organization.plans', {
      url: 'plans/',
      templateUrl: 'views/customer/plans.html',
      data: {
        pageTitle: 'Plans'
      }
    })

    .state('services', {
      url: '/services/',
      abstract: true,
      template: '<customer-workspace><ui-view></ui-view></customer-workspace>',
      data: {
        auth: true,
        workspace: 'organization'
      }
    })

    .state('services.create', {
      url: 'add/',
      template: '<provider-create></provider-create>',
      data: {
        pageTitle: 'Create provider'
      }
    })
};