'use strict';

(function() {

  angular.module('ncsaas')
    .controller('ProjectAddController', [
      'projectsService',
      'currentStateService',
      'baseControllerAddClass',
      '$rootScope',
      '$state',
      'ncUtilsFlash',
      ProjectAddController]);

  function ProjectAddController(
    projectsService,
    currentStateService,
    baseControllerAddClass,
    $rootScope,
    $state,
    ncUtilsFlash) {
    var controllerScope = this;
    var ProjectController = baseControllerAddClass.extend({
      userRole: 'admin',
      init: function() {
        this.service = projectsService;
        this.controllerScope = controllerScope;
        this._super();
        this.detailsState = 'project.details';
        this.redirectToDetailsPage = true;
        this.project = this.instance;
      },
      activate: function() {
        var vm = this;
        currentStateService.getCustomer().then(function(customer) {
          vm.project.customer = customer.url;
        });
      },
      afterSave: function(project) {
        $rootScope.$broadcast('refreshProjectList', {
          model: project, new: true, current: true
        });
        this._super();
      },
      onError: function(errorObject) {
        ncUtilsFlash.error(errorObject.data.detail);
      },
      cancel: function() {
        currentStateService.getCustomer().then(function(customer) {
          $state.go('organization.projects', {uuid: customer.uuid});
        });
      }
    });

    controllerScope.__proto__ = new ProjectController();
  }
})();

(function() {
  angular.module('ncsaas')
    .controller('ProjectDetailsController', ProjectDetailsController);

  ProjectDetailsController.$inject = [
    '$scope', 'currentStateService', 'tabCounterService',
    'eventsService', 'projectsService', '$state', 'AppStoreUtilsService'
  ];
  function ProjectDetailsController(
    $scope, currentStateService, tabCounterService,
    eventsService, projectsService, $state, AppStoreUtilsService) {
    activate();

    function activate() {
      $scope.items = [
        {
          icon: "fa-bookmark",
          label: "Project details",
          link: "project.details({uuid: context.project.uuid})",
        },
        {
          icon: "fa-shopping-cart",
          label: "Service store",
          feature: "appstore",
          action: AppStoreUtilsService.openDialog,
          state: "appstore",
        },
        {
          label: "Resources",
          icon: "fa-files-o",
          link: "project.resources",
          children: [
            {
              link: "project.resources.vms({uuid: context.project.uuid})",
              icon: "fa-desktop",
              label: "Virtual machines",
              feature: "vms",
              countFieldKey: "vms"
            },
            {
              link: "project.resources.clouds({uuid: context.project.uuid})",
              icon: "fa-cloud",
              label: "Private clouds",
              feature: "private_clouds",
              countFieldKey: "private_clouds"
            },
            {
              link: "project.resources.apps({uuid: context.project.uuid})",
              icon: "fa-cube",
              label: "Applications",
              feature: "apps",
              countFieldKey: "apps"
            }
          ]
        },
        {
          link: "project.support({uuid: context.project.uuid})",
          icon: "fa-question-circle",
          label: "Support",
          feature: "premiumSupport",
          countFieldKey: "premium_support_contracts"
        },
        {
          link: "project.events({uuid: context.project.uuid})",
          icon: "fa-bell-o",
          label: "Audit logs",
          feature: "eventlog"
        },
        {
          link: "project.alerts({uuid: context.project.uuid})",
          icon: "fa-fire",
          label: "Alerts",
          feature: "alerts",
          countFieldKey: "alerts"
        },
        {
          link: "project.delete({uuid: context.project.uuid})",
          icon: "fa-wrench",
          label: "Manage"
        }
      ];
      $scope.$on('currentProjectUpdated', function() {
        refreshProject();
      });
      $scope.$on('authService:signin', function() {
        refreshProject();
      });
      refreshProject();
    }

    function refreshProject() {
      currentStateService.getProject().then(function(project) {
        $scope.currentProject = project;
        $scope.context = {project: project};
        connectCounters(project);
      });
    }

    function connectCounters(project) {
      if ($scope.timer) {
        tabCounterService.cancel($scope.timer);
      }

      $scope.timer = tabCounterService.connect({
        $scope: $scope,
        tabs: $scope.items,
        getCounters: getCounters.bind(null, project),
        getCountersError: getCountersError
      });
    }

    function getCounters(project) {
      var query = angular.extend(
        {UUID: project.uuid},
        eventsService.defaultFilter
      );
      return projectsService.getCounters(query);
    }

    function getCountersError(error) {
      if (error.status == 404) {
        projectsService.getFirst().then(function(project) {
          $state.go('project.details', {uuid: project.uuid});
        });
      } else {
        tabCounterService.cancel($scope.timer);
      }
    }
  }
})();
