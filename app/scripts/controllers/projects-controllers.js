'use strict';

(function() {
  angular.module('ncsaas')
    .service('BaseProjectListController', [
      'baseControllerListClass',
      'projectsService',
      'usersService',
      'currentStateService',
      'customersService',
      '$rootScope',
      'ENV',
      'ENTITYLISTFIELDTYPES',
      'ncUtils',
      BaseProjectListController]);

    function BaseProjectListController(
      baseControllerListClass,
      projectsService,
      usersService,
      currentStateService,
      customersService,
      $rootScope,
      ENV,
      ENTITYLISTFIELDTYPES,
      ncUtils) {

      var controllerClass = baseControllerListClass.extend({
        expandableOptions: [
          {
            isList: false,
            addItemBlock: false,
            viewType: 'project-details',
            isOwner: false
          }
        ],

        init: function() {
          this.service = projectsService;
          this.checkPermissions();
          this._super();
          this.searchFieldName = 'name';
          this.actionButtonsListItems = [
            {
              title: 'Remove',
              icon: 'fa-trash',
              clickFunction: this.remove.bind(this),

              isDisabled: function(project) {
                return !this.userCanManageProjects || this.projectHasResources(project);
              }.bind(this),

              tooltip: function(project) {
                if (!this.userCanManageProjects) {
                  return 'Only customer owner or staff can remove project';
                }
                if (this.projectHasResources(project)) {
                 return 'Project has resources. Please remove them first';
                }
              }.bind(this),
            }
          ];
          this.entityOptions = {
            entityData: {
              noDataText: 'You have no projects yet.',
              noMatchesText: 'No projects found matching filter.',
              title: 'Projects',
              createLink: 'project-create',
              createLinkText: 'Add project',
              expandable: true,
              rowTemplateUrl: 'views/project/row.html'
            },
            list: [
              {
                name: 'Name',
                propertyName: 'name',
                type: ENTITYLISTFIELDTYPES.name,
                link: 'project.details({uuid: entity.uuid})'
              },
              {
                name: 'Creation date',
                propertyName: 'created',
                type: ENTITYLISTFIELDTYPES.date
              }
            ]
          };
          if (ENV.featuresVisible || ENV.toBeFeatures.indexOf('resources') == -1) {
            this.entityOptions.list.push({
              name: 'VMs',
              propertyName: 'vm_count',
              className: 'resources-count',
              emptyText: '0'
            });
            this.entityOptions.list.push({
              name: 'Apps',
              propertyName: 'app_count',
              className: 'resources-count',
              emptyText: '0'
            });
            this.entityOptions.list.push({
              name: 'PCs',
              propertyName: 'private_cloud_count',
              className: 'resources-count',
              emptyText: '0'
            });
          }
          if (ENV.featuresVisible || ENV.toBeFeatures.indexOf('premiumSupport') == -1) {
            this.entityOptions.list.push({
              name: 'SLA',
              propertyName: 'plan_name',
              type: ENTITYLISTFIELDTYPES.none,
              emptyText: 'No plan',
              className: 'sla-info'
            });
          }
        },
        afterGetList: function() {
          for (var i = 0; i < this.list.length; i++) {
            var item = this.list[i];
            if (item.plan) {
              item.plan_name = item.plan.name;
            } else if (item.has_pending_contracts) {
              item.plan_name = 'Pending';
            }
            this.setProjectCounters(item);
          }
          this._super();
        },
        checkPermissions: function() {
          customersService.isOwnerOrStaff().then(function() {
            this.userCanManageProjects = true;
          }.bind(this));
        },
        projectHasResources: function(project) {
          for (var i = 0; i < project.quotas.length; i++) {
            if (project.quotas[i].name == 'nc_resource_count') {
              return project.quotas[i].usage > 0;
            }
          }
        },
        setProjectCounters: function(project) {
          for (var i = 0; i < project.quotas.length; i++) {
            var quota = project.quotas[i];
            if (quota.name == 'nc_app_count') {
              project.app_count = quota.usage;
            } else if (quota.name == 'nc_vm_count') {
              project.vm_count = quota.usage;
            } else if (quota.name == 'nc_private_cloud_count') {
              project.private_cloud_count = quota.usage;
            }
          }
        },
        removeInstance: function(model) {
          currentStateService.setProject(null);
          return model.$delete().catch(function() {
            currentStateService.setProject(model);
          });
        },
        afterInstanceRemove: function(instance) {
          $rootScope.$broadcast('refreshProjectList', {model: instance, remove: true});
          this._super(instance);
        }
      });
      return controllerClass;
    }
})();

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

  angular.module('ncsaas')
    .controller('ProjectDetailUpdateController', [
      '$stateParams',
      '$rootScope',
      '$scope',
      '$interval',
      '$q',
      'ENV',
      'projectsService',
      'baseControllerDetailUpdateClass',
      'eventsService',
      'currentStateService',
      '$state',
      ProjectDetailUpdateController
    ]);

  function ProjectDetailUpdateController(
    $stateParams,
    $rootScope,
    $scope,
    $interval,
    $q,
    ENV,
    projectsService,
    baseControllerDetailUpdateClass,
    eventsService,
    currentStateService,
    $state) {
    var controllerScope = this,
      timer,
      Controller = baseControllerDetailUpdateClass.extend({
      customer: null,
      canEdit: false,

      init:function() {
        this.service = projectsService;
        this.controllerScope = controllerScope;
        this.setSignalHandler('refreshCounts', this.setCounters.bind(controllerScope));
        this._super();
        this.detailsState = 'project.details';
        this.detailsViewOptions = {
          title_plural: 'projects',
          listState: "organization.projects({uuid: controller.model.customer_uuid})",
          aboutFields: [
            {
              fieldKey: 'name',
              isEditable: true,
              className: 'name'
            },
            {
              fieldKey: 'description',
              isEditable: true,
              className: 'details',
              emptyText: 'Add description'
            }
          ],
          tabs: [
            {
              title: 'Events',
              key: 'eventlog',
              viewName: 'tabEventlog',
              icon: 'event',
              count: -1
            },
            {
              title: 'Alerts',
              key: 'alerts',
              viewName: 'tabAlerts',
              countFieldKey: 'alerts',
              icon: 'alerts'
            },
            {
              title: 'VMs',
              key: ENV.resourcesTypes.vms,
              viewName: 'tabResources',
              countFieldKey: 'vms',
              icon: 'resource'
            },
            {
              title: 'Private clouds',
              key: ENV.resourcesTypes.privateClouds,
              viewName: 'tabPrivateClouds',
              countFieldKey: 'private_clouds',
              icon: 'cloud'
            },
            {
              title: 'Applications',
              key: ENV.resourcesTypes.applications,
              viewName: 'tabApplications',
              countFieldKey: 'apps',
              icon: 'application'
            },
            {
              title: 'Support',
              key: 'premiumSupport',
              viewName: 'tabPremiumSupport',
              countFieldKey: 'premium_support_contracts',
              icon: 'help'
            },
            {
              title: 'Manage',
              key: 'delete',
              viewName: 'tabDelete',
              hideSearch: true,
              icon: 'wrench'
            }
          ]
        };
        this.detailsViewOptions.activeTab = this.getActiveTab();
      },
      afterUpdate: function() {
        $rootScope.$broadcast('refreshProjectList', {model: this.model, update: true});
      },
      getModel: function() {
        if ($stateParams.uuid) {
          return this.service.$get($stateParams.uuid);
        } else {
          return currentStateService.getProject();
        }
      },
      afterActivate: function() {
        this.canEdit = this.model;
        if ($stateParams.uuid) {
          $rootScope.$broadcast('adjustCurrentProject', this.model);
        }
        this.setCounters();
        timer = $interval(this.setCounters.bind(this), ENV.countersTimerInterval * 1000);
        $scope.$on('$destroy', function() {
          $interval.cancel(timer);
        });
      },
      getCounters: function() {
        return currentStateService.getProject().then(function(project) {
          if (!project) {
            return $q.reject();
          }
          var query = angular.extend(
            {UUID: project.uuid},
            eventsService.defaultFilter
          );
          return projectsService.getCounters(query);
        });
      },
      getCountersError: function() {
        $interval.cancel(timer);
        projectsService.getFirst().then(function(project) {
          $state.go('project.details', {uuid: project.uuid});
        });
      }
    });

    controllerScope.__proto__ = new Controller();
  }

})();

(function() {
  angular.module('ncsaas')
    .controller('ProjectDetailsController', ProjectDetailsController);

  ProjectDetailsController.$inject = [
    '$scope', 'currentStateService'
  ];
  function ProjectDetailsController($scope, currentStateService) {
    function refreshProject() {
      currentStateService.getProject().then(function(project) {
        $scope.currentProject = project;
        $scope.context = {project: project};
      });
    }
    $scope.$on('currentProjectUpdated', function() {
      refreshProject();
    });
    refreshProject();

    $scope.items = [
      {
        link: "appstore.store",
        icon: "fa-shopping-cart",
        label: "Marketplace",
        feature: "appstore"
      },
      {
        label: "Resources",
        icon: "fa-files-o",
        state: "project.resources",
        children: [
          {
            link: "project.resources.vms({uuid: context.project.uuid})",
            icon: "fa-desktop",
            label: "Virtual machines",
            feature: "vms"
          },
          {
            link: "project.resources.clouds({uuid: context.project.uuid})",
            icon: "fa-cloud",
            label: "Private clouds",
            feature: "private_clouds"
          },
          {
            link: "project.resources.apps({uuid: context.project.uuid})",
            icon: "fa-cube",
            label: "Applications",
            feature: "apps"
          }
        ]
      },
      {
        link: "project.support({uuid: context.project.uuid})",
        icon: "fa-question-circle",
        label: "Support",
        feature: "premiumSupport"
      },
      {
        link: "project.details({uuid: context.project.uuid})",
        icon: "fa-bell-o",
        label: "Audit logs",
        feature: "eventlog"
      },
      {
        link: "project.alerts({uuid: context.project.uuid})",
        icon: "fa-fire",
        label: "Alerts",
        feature: "alerts"
      },
      {
        link: "project.delete({uuid: context.project.uuid})",
        icon: "fa-wrench",
        label: "Manage"
      }
    ];
  }
})();
