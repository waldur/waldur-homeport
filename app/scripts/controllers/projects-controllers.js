'use strict';

(function() {
  angular.module('ncsaas')
    .service('BaseProjectListController', [
      'baseControllerListClass',
      'projectsService',
      'usersService',
      'currentStateService',
      '$rootScope',
      '$state',
      'ENV',
      'ENTITYLISTFIELDTYPES',
      BaseProjectListController]);

    function BaseProjectListController(
      baseControllerListClass,
      projectsService,
      usersService,
      currentStateService,
      $rootScope,
      $state,
      ENV,
      ENTITYLISTFIELDTYPES) {

      var controllerClass = baseControllerListClass.extend({
        init: function() {
          this.service = projectsService;
          this.checkPermissions();
          this._super();
          this.searchFieldName = 'name';
          this.actionButtonsListItems = [
            {
              title: 'Remove',
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
          var vm = this;
          if (ENV.featuresVisible || ENV.toBeFeatures.indexOf('resources') == -1) {
            currentStateService.isQuotaExceeded('resource').then(function(response) {
              if (!response) {
                vm.actionButtonsListItems.push({
                  title: 'Create resource',
                  clickFunction: function(project) {
                    $rootScope.$broadcast('adjustCurrentProject', project);
                    $state.go('appstore.store')
                  }
                });
              }
            });
          }
          if (ENV.featuresVisible || ENV.toBeFeatures.indexOf('import') == -1) {
            currentStateService.isQuotaExceeded('resource').then(function(response) {
              if (!response) {
                vm.actionButtonsListItems.push({
                  title: 'Import resource',
                  clickFunction: function(project) {
                    $rootScope.$broadcast('adjustCurrentProject', project);
                    $state.go('import.import');
                  }
                });
              }
            });
          }
          this.entityOptions = {
            entityData: {
              noDataText: 'You have no projects yet.',
              title: 'Projects',
              createLink: 'projects.create',
              createLinkText: 'Add project',
              expandable: true
            },
            list: [
              {
                name: 'Name',
                propertyName: 'name',
                type: ENTITYLISTFIELDTYPES.name,
                link: 'projects.details({uuid: entity.uuid})',
                showForMobile: ENTITYLISTFIELDTYPES.showForMobile
              },
              {
                name: 'Creation date',
                propertyName: 'created',
                type: ENTITYLISTFIELDTYPES.dateCreated
              }
            ]
          };
          if (ENV.featuresVisible || ENV.toBeFeatures.indexOf('premiumSupport') == -1) {
            this.entityOptions.list.push({
              name: 'SLA',
              propertyName: 'plan_name',
              type: ENTITYLISTFIELDTYPES.none,
              emptyText: 'No plan'
            });
          }
        },
        afterGetList: function() {
          if (ENV.featuresVisible || ENV.toBeFeatures.indexOf('premiumSupport') == -1) {
            for (var i = 0; i < this.list.length; i++) {
              var item = this.list[i];
              if (item.plan) {
                item.plan_name = item.plan.name;
              } else if (item.has_pending_contracts) {
                item.plan_name = 'Pending';
              }
            }
          }
        },
        checkPermissions: function() {
          var vm = this;
          vm.userCanManageProjects = false;
          if (usersService.currentUser.is_staff) {
            vm.userCanManageProjects = true;
            return;
          }
          currentStateService.getCustomer().then(function(customer) {
            for (var i = 0; i < customer.owners.length; i++) {
              if (usersService.currentUser.uuid === customer.owners[i].uuid) {
                vm.userCanManageProjects = true;
                break;
              }
            }
          });
        },
        projectHasResources: function(project) {
          for (var i = 0; i < project.quotas.length; i++) {
            if (project.quotas[i].name == 'nc_resource_count') {
              return project.quotas[i].usage > 0;
            }
          }
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
      'joinServiceProjectLinkService',
      'baseControllerAddClass',
      '$rootScope',
      '$state',
      'projectPermissionsService',
      'usersService',
      'ncUtilsFlash',
      ProjectAddController]);

  function ProjectAddController(
    projectsService,
    currentStateService,
    joinServiceProjectLinkService,
    baseControllerAddClass,
    $rootScope,
    $state,
    projectPermissionsService,
    usersService,
    ncUtilsFlash) {
    var controllerScope = this;
    var ProjectController = baseControllerAddClass.extend({
      userRole: 'admin',
      user: {},
      init: function() {
        this.service = projectsService;
        this.controllerScope = controllerScope;
        this._super();
        this.detailsState = 'projects.details';
        this.redirectToDetailsPage = true;
        this.project = this.instance;
      },
      activate: function() {
        var vm = this;
        currentStateService.getCustomer().then(function(customer) {
          vm.project.customer = customer.url;
        });
        usersService.getCurrentUser().then(function(user) {
          vm.user = user;
        });
      },
      afterSave: function() {
        var vm = this;
        vm.addUser();
        joinServiceProjectLinkService.addProject(vm.project).then(function() {
          $rootScope.$broadcast('refreshProjectList', {model: vm.project, new: true, current: true});
        });
        vm._super();
      },
      onError: function(errorObject) {
        ncUtilsFlash.error(errorObject.data.detail);
      },
      cancel: function() {
        currentStateService.getCustomer().then(function(customer) {
          $state.go('organizations.details', {uuid: customer.uuid, tab: 'projects'});
        });
      },
      addUser: function() {
        var vm = this;
        var instance = projectPermissionsService.$create();
        instance.user = vm.user.url;
        instance.project = vm.project.url;
        instance.role = vm.userRole;
        instance.$save();
      }
    });

    controllerScope.__proto__ = new ProjectController();
  }

  angular.module('ncsaas')
    .controller('ProjectDetailUpdateController', [
      '$stateParams',
      '$rootScope',
      '$interval',
      'ENV',
      'projectsService',
      'baseControllerDetailUpdateClass',
      'resourcesCountService',
      'servicesService',
      'alertsService',
      'eventsService',
      'currentStateService',
      ProjectDetailUpdateController
    ]);

  function ProjectDetailUpdateController(
    $stateParams,
    $rootScope,
    $interval,
    ENV,
    projectsService,
    baseControllerDetailUpdateClass,
    resourcesCountService,
    servicesService,
    alertsService,
    eventsService,
    currentStateService) {
    var controllerScope = this;
    var Controller = baseControllerDetailUpdateClass.extend({
      customer: null,
      canEdit: false,

      init:function() {
        this.service = projectsService;
        this.controllerScope = controllerScope;
        this.setSignalHandler('refreshCounts', this.setCounters.bind(controllerScope));
        this._super();
        this.detailsViewOptions = {
          title: 'Project',
          listState: "organizations.details({uuid: controller.model.customer_uuid, tab: 'projects'})",
          aboutFields: [
            {
              fieldKey: 'name',
              isEditable: true,
              className: 'name'
            }
          ],
          tabs: [
            {
              title: 'Events',
              key: 'eventlog',
              viewName: 'tabEventlog',
              getCount: function() {
                var query = angular.extend(eventsService.defaultFilter, {
                  scope: this.model.url
                });
                return resourcesCountService.events(query);
              }
            },
            {
              title: 'Alerts',
              key: 'alerts',
              viewName: 'tabAlerts',
              getCount: function() {
                var query = angular.extend(alertsService.defaultFilter, {
                  aggregate: 'project',
                  uuid: this.model.uuid
                });
                return resourcesCountService.alerts(query);
              }
            },
            {
              title: 'VMs',
              key: ENV.resourcesTypes.vms,
              viewName: 'tabResources',
              getCount: function() {
                return this.getResourceCount(ENV.VirtualMachines, this.model.uuid);
              }
            },
            {
              title: 'Applications',
              key: ENV.resourcesTypes.applications,
              viewName: 'tabApplications',
              getCount: function() {
                return this.getResourceCount(ENV.Applications, this.model.uuid);
              }
            },
            {
              title: 'Backups',
              key: 'backups',
              viewName: 'tabBackups',
              getCount: function() {
                return resourcesCountService.backups({project_uuid: this.model.uuid});
              }
            },
            {
              title: 'People',
              key: 'people',
              viewName: 'tabUsers',
              getCount: function() {
                return resourcesCountService.users({project: this.model.uuid});
              }
            },
            {
              title: 'Support',
              key: 'premiumSupport',
              viewName: 'tabPremiumSupport',
              getCount: function() {
                return resourcesCountService.premiumSupportContracts({
                  project_uuid: this.model.uuid
                });
              }
            },
            {
              title: 'Manage',
              key: 'delete',
              viewName: 'tabDelete'
            }
          ]
        };
        this.detailsViewOptions.activeTab = this.getActiveTab(this.detailsViewOptions.tabs, $stateParams.tab);
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
        $interval(this.setCounters.bind(controllerScope), ENV.countersTimerInterval * 1000);
      },
      getResourceCount: function(category, project_uuid) {
        return servicesService.getResourceTypes(category).then(function(types) {
          return resourcesCountService.resources({
            project_uuid: project_uuid,
            resource_type: types
          });
        });
      }
    });

    controllerScope.__proto__ = new Controller();
  }

})();
