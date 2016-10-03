(function() {
  angular.module('ncsaas').config(function($stateProvider) {
    $stateProvider
      .state('project', {
        url: '/projects/:uuid/',
        abstract: true,
        templateUrl: 'views/project/base.html',
        data: {
          auth: true,
          showProject: true
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
              if (error.status == 404) {
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
        controller: 'ProjectResourcesTabController',
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
        templateUrl: 'views/project/tab-delete.html',
        controller: 'ProjectDeleteTabController',
        controllerAs: 'delController',
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
          pageTitle: 'Import resources from provider',
          showProject: true
        }
      })

      .state('import.import', {
        url: '?service_type&service_uuid',
        templateUrl: 'views/import/import.html',
      })
  });
})();
