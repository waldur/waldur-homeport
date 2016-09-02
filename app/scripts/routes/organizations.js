(function() {
  angular.module('ncsaas').config(function($stateProvider) {
    $stateProvider
      .state('organization', {
          url: '/organizations/:uuid/',
          abstract: true,
          templateUrl: 'views/customer/base.html',
          data: {
            bodyClass: 'white-bg'
          },
          resolve: {
            currentCustomer: function(
              $stateParams, $state, $rootScope, customersService, currentStateService) {
              if (!$stateParams.uuid) {
                return currentStateService.getCustomer();
              }
              return customersService.$get($stateParams.uuid).then(function(customer) {
                $rootScope.$broadcast('adjustCurrentCustomer', customer);
                return customer;
              }, function() {
                $state.go('errorPage.notFound');
              });
            }
          }
        })

      .state('organization.details', {
        url: '',
        templateUrl: 'views/partials/list.html',
        controller: 'CustomerEventTabController',
        controllerAs: 'Ctrl',
        data: {
          pageTitle: 'Events'
        }
      })

      .state('organization.alerts', {
        url: 'alerts/',
        templateUrl: 'views/customer/tab-alerts.html',
        controller: 'CustomerAlertsListController',
        controllerAs: 'Ctrl',
        data: {
          pageTitle: 'Alerts'
        }
      })

      .state('organization.projects', {
        url: 'projects/',
        templateUrl: 'views/partials/list.html',
        controller: 'CustomerProjectTabController',
        controllerAs: 'Ctrl',
        data: {
          pageTitle: 'Projects'
        }
      })

      .state('organization.team', {
        url: 'team/',
        templateUrl: 'views/partials/list.html',
        controller: 'CustomerTeamTabController',
        controllerAs: 'Ctrl',
        data: {
          pageTitle: 'Team'
        }
      })

      .state('organization.providers', {
        url: 'providers/?providerUuid&providerType',
        templateUrl: 'views/partials/list.html',
        controller: 'CustomerServiceTabController',
        controllerAs: 'Ctrl',
        data: {
          pageTitle: 'Providers'
        }
      })

      .state('organization.virtual-machines', {
        url: 'virtual-machines/',
        templateUrl: 'views/partials/list.html',
        controller: 'CustomerResourcesTabController',
        controllerAs: 'Ctrl',
        data: {
          pageTitle: 'Virtual machines'
        }
      })

      .state('organization.applications', {
        url: 'applications/',
        templateUrl: 'views/partials/list.html',
        controller: 'CustomerApplicationsTabController',
        controllerAs: 'Ctrl',
        data: {
          pageTitle: 'Applications'
        }
      })

      .state('organization.private-clouds', {
        url: 'private-clouds/',
        templateUrl: 'views/partials/list.html',
        controller: 'CustomerPrivateCloudTabController',
        controllerAs: 'Ctrl',
        data: {
          pageTitle: 'Private clouds'
        }
      })

      .state('organization.billing', {
        url: 'billing/',
        templateUrl: 'views/customer/tab-billing.html',
        data: {
          pageTitle: 'Billing'
        }
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
          pageTitle: 'Delete'
        }
      })

      .state('organization.plans', {
        url: 'plans/',
        templateUrl: 'views/customer/plans.html',
        data: {
          pageTitle: 'Plans'
        }
      })

      .state('organization.cost-analysis', {
        url: 'cost-analysis/',
        templateUrl: 'views/dashboard/cost-tab.html',
        data: {
          pageTitle: 'Cost analysis'
        }
      })

      .state('organization.resource-usage', {
        url: 'resource-usage/',
        templateUrl: 'views/dashboard/resources-tab.html',
        data: {
          pageTitle: 'Resource usage'
        }
      })
  });
})();
