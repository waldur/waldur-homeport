(function() {
  angular.module('ncsaas').config(function($stateProvider) {
    $stateProvider
      .state('projects', {
        url: '/projects/',
        abstract: true,
        template: '<ui-view/>',
        data: {
          specialClass: 'white-bg'
        }
      })

      .state('projects.create', {
        url: 'add/',
        templateUrl: 'views/project/create.html',
        controller: 'ProjectAddController',
        controllerAs: 'ProjectAdd',
        data: {
          pageTitle: 'Create project'
        }
      })

      .state('projects.details', {
        url: ':uuid/',
        abstract: true,
        templateUrl: 'views/project/base.html',
        resolve: {
          currentProject: function(
            $stateParams, $state, $rootScope, projectsService, currentStateService) {
            if (!$stateParams.uuid) {
              return currentStateService.getProject();
            }
            return projectsService.$get($stateParams.uuid).then(function(project) {
              $rootScope.$broadcast('adjustCurrentProject', project);
              return project;
            }, function() {
              $state.go('errorPage.notFound');
            });
          }
        }
      })

      .state('projects.details.events', {
        url: 'events/',
        templateUrl: 'views/partials/list.html',
        controller: 'ProjectEventTabController',
        controllerAs: 'Ctrl',
        data: {
          pageTitle: 'Events'
        }
      })

      .state('projects.details.alerts', {
        url: 'alerts/',
        templateUrl: 'views/partials/list.html',
        controller: 'ProjectAlertTabController',
        controllerAs: 'Ctrl',
        data: {
          pageTitle: 'Alerts'
        }
      })

      .state('projects.details.virtual-machines', {
        url: 'virtual-machines/',
        templateUrl: 'views/partials/list.html',
        controller: 'ProjectResourcesTabController',
        controllerAs: 'Ctrl',
        data: {
          pageTitle: 'Virtual machines'
        }
      })

      .state('projects.details.applications', {
        url: 'applications/',
        templateUrl: 'views/partials/list.html',
        controller: 'ProjectApplicationsTabController',
        controllerAs: 'Ctrl',
        data: {
          pageTitle: 'Applications'
        }
      })

      .state('projects.details.private-clouds', {
        url: 'private-clouds/',
        templateUrl: 'views/partials/list.html',
        controller: 'ProjectPrivateCloudsTabController',
        controllerAs: 'Ctrl',
        data: {
          pageTitle: 'Private clouds'
        }
      })

      .state('projects.details.support', {
        url: 'support/',
        templateUrl: 'views/partials/list.html',
        controller: 'ProjectSupportTabController',
        controllerAs: 'Ctrl',
        data: {
          pageTitle: 'Premium support'
        }
      })

      .state('projects.details.delete', {
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
          specialClass: 'white-bg',
          pageTitle: 'Import resources from provider'
        }
      })

      .state('import.import', {
        url: '?service_type&service_uuid',
        templateUrl: 'views/import/import.html',
       })

      .state('compare', {
        url: '/compare/',
        templateUrl: 'views/project/base.html',
        abstract: true,
        data: {
          specialClass: 'white-bg',
          pageTitle: 'Compare flavors'
        }
      })

      .state('compare.vms', {
        url: '',
        templateUrl: 'views/compare/table.html'
      })
  });
})();
