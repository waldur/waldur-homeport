(function() {
  angular.module('ncsaas').config(function($stateProvider) {
    $stateProvider
      .state('project', {
        url: '/projects/:uuid/',
        abstract: true,
        templateUrl: 'views/project/base.html',
        data: {
          auth: true,
          workspace: 'project'
        },
        resolve: {
          currentProject: function(
            $stateParams, $state, $rootScope, projectsService, currentStateService) {
            if (!$stateParams.uuid) {
              return currentStateService.getProject();
            }
            return projectsService.$get($stateParams.uuid).then(function(project) {
              $rootScope.$broadcast('adjustCurrentProject', project);
              return project;
            }, function(error) {
              if (error.status === 404) {
                $state.go('errorPage.notFound');
              }
            });
          },
          currentCustomer: function(
            $stateParams, $state, $rootScope, customersService, currentStateService, $window, ENV) {
            return customersService.$get($window.localStorage[ENV.currentCustomerUuidStorageKey])
              .then(function(customer) {
              $rootScope.$broadcast('adjustCurrentCustomer', customer);
              return customer;
            }, function(error) {
              if (error.status === 404) {
                $state.go('errorPage.notFound');
              }
            });
          }
        }
      })

      .state('project-create', {
        url: '/projects/add/',
        templateUrl: 'views/project/create.html',
        controller: 'ProjectAddController',
        controllerAs: 'ProjectAdd',
        data: {
          pageTitle: 'Create project',
          workspace: 'organization',
          auth: true
        },
      })

      .state('project.details', {
        url: '',
        templateUrl: 'views/dashboard/project.html',
        controller: 'ProjectDashboardController',
        controllerAs: 'DashboardCtrl',
        bindToController: true,
        data: {
          pageTitle: 'Project dashboard',
          pageClass: 'gray-bg'
        }
      })

      .state('project.events', {
        url: 'events/',
        templateUrl: 'views/partials/filtered-list.html',
        controller: 'ProjectEventTabController',
        controllerAs: 'ListController',
        data: {
          pageTitle: 'Audit logs'
        }
      })

      .state('project.alerts', {
        url: 'alerts/',
        templateUrl: 'views/partials/filtered-list.html',
        controller: 'ProjectAlertTabController',
        controllerAs: 'ListController',
        data: {
          pageTitle: 'Alerts'
        }
      })

      .state('project.resources', {
        url: '',
        abstract: true,
        template: '<ui-view/>'
      })

      .state('project.resources.vms', {
        url: 'virtual-machines/',
        templateUrl: 'views/partials/filtered-list.html',
        controller: 'ProjectVirtualMachinesListController',
        controllerAs: 'ListController',
        data: {
          pageTitle: 'Virtual machines'
        }
      })

      .state('project.resources.apps', {
        url: 'applications/',
        templateUrl: 'views/partials/filtered-list.html',
        controller: 'ProjectApplicationsTabController',
        controllerAs: 'ListController',
        data: {
          pageTitle: 'Applications'
        }
      })

      .state('project.resources.clouds', {
        url: 'private-clouds/',
        templateUrl: 'views/partials/filtered-list.html',
        controller: 'ProjectPrivateCloudsTabController',
        controllerAs: 'ListController',
        data: {
          pageTitle: 'Private clouds'
        }
      })

      .state('project.resources.storage', {
        url: 'storage/',
        templateUrl: 'views/project/storage.html',
        controller: 'StorageTabController',
        data: {
          pageTitle: 'Storage'
        },
        abstract: true
      })


      .state('project.resources.storage.tabs', {
        url: '',
        views: {
          volumes: {
            controller: 'VolumesListController as ListController',
            templateUrl: 'views/partials/filtered-list.html',
          },
          snapshots: {
            controller: 'SnapshotsListController as ListController',
            templateUrl: 'views/partials/filtered-list.html',
          }
        }
      })

      .state('project.support', {
        url: 'support/',
        templateUrl: 'views/partials/list.html',
        controller: 'ProjectSupportTabController',
        controllerAs: 'Ctrl',
        data: {
          pageTitle: 'Premium support'
        }
      })

      .state('project.delete', {
        url: 'delete/',
        template: '<project-manage></project-manage>',
        data: {
          pageTitle: 'Manage'
        }
      })

      .state('import', {
        url: '/import/',
        templateUrl: 'views/project/base.html',
        abstract: true,
        data: {
          auth: true,
          workspace: 'project',
          pageTitle: 'Import resources from provider'
        }
      })

      .state('project.team', {
        url: 'team/',
        templateUrl: 'views/partials/filtered-list.html',
        controller: 'ProjectUsersListController',
        controllerAs: 'ListController',
        data: {
          pageTitle: 'Team'
        }
      })

      .state('import.import', {
        url: '?service_type&service_uuid',
        templateUrl: 'views/import/import.html',
      });
  });
})();
