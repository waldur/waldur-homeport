(function() {
  angular.module('ncsaas').config(function($stateProvider) {
    $stateProvider
      .state('organizations', {
          url: '/organizations/',
          abstract: true,
          templateUrl: 'views/customer/base.html',
          data: {
            specialClass: 'white-bg'
          }
        })

      .state('organizations.list', {
        url: '',
        templateUrl: 'views/partials/list.html',
        controller: 'CustomerListController',
        controllerAs: 'Ctrl',
        data: {
          pageTitle: 'Organizations'
        },
        auth: true
      })

      .state('organizations.details', {
        url: ':uuid/',
        abstract: true,
        template: '<ui-view/>',
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

      .state('organizations.details.alerts', {
        url: 'alerts/',
        templateUrl: 'views/customer/tab-alerts.html',
        controller: 'CustomerAlertsListController',
        controllerAs: 'Ctrl',
        data: {
          pageTitle: 'Alerts'
        }
      })

      .state('organizations.details.events', {
        url: 'events/',
        templateUrl: 'views/partials/list.html',
        controller: 'CustomerEventTabController',
        controllerAs: 'Ctrl',
        data: {
          pageTitle: 'Events'
        }
      })

      .state('organizations.details.projects', {
        url: 'projects/',
        templateUrl: 'views/partials/list.html',
        controller: 'CustomerProjectTabController',
        controllerAs: 'Ctrl',
        data: {
          pageTitle: 'Projects'
        }
      })

      .state('organizations.details.team', {
        url: 'team/',
        templateUrl: 'views/partials/list.html',
        controller: 'CustomerTeamTabController',
        controllerAs: 'Ctrl',
        data: {
          pageTitle: 'Team'
        }
      })

      .state('organizations.details.providers', {
        url: 'providers/',
        templateUrl: 'views/partials/list.html',
        controller: 'CustomerServiceTabController',
        controllerAs: 'Ctrl',
        data: {
          pageTitle: 'Providers'
        }
      })

      .state('organizations.details.virtual-machines', {
        url: 'virtual-machines/',
        templateUrl: 'views/partials/list.html',
        controller: 'CustomerResourcesTabController',
        controllerAs: 'Ctrl',
        data: {
          pageTitle: 'Virtual machines'
        }
      })

      .state('organizations.details.applications', {
        url: 'applications/',
        templateUrl: 'views/partials/list.html',
        controller: 'CustomerApplicationsTabController',
        controllerAs: 'Ctrl',
        data: {
          pageTitle: 'Applications'
        }
      })

      .state('organizations.details.private-clouds', {
        url: 'private-clouds/',
        templateUrl: 'views/partials/list.html',
        controller: 'CustomerPrivateCloudTabController',
        controllerAs: 'Ctrl',
        data: {
          pageTitle: 'Private clouds'
        }
      })

      .state('organizations.details.billing', {
        url: 'billing/',
        templateUrl: 'views/customer/tab-billing.html',
        data: {
          pageTitle: 'Billing'
        }
      })

      .state('organizations.details.sizing', {
        url: 'sizing/',
        templateUrl: 'views/customer/tab-sizing.html',
        data: {
          pageTitle: 'Sizing'
        }
      })

      .state('organizations.details.delete', {
        url: 'delete/',
        templateUrl: 'views/customer/tab-delete.html',
        controller: 'CustomerDeleteTabController',
        controllerAs: 'DeleteController',
        data: {
          pageTitle: 'Delete'
        }
      })

      .state('organizations.plans', {
        url: ':uuid/plans/',
        templateUrl: 'views/customer/plans.html',
        data: {
          pageTitle: 'Plans'
        }
      })
  });
})();
