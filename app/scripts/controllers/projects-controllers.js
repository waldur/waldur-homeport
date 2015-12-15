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
              noMatchesText: 'No projects found matching filter.',
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
          if (ENV.featuresVisible || ENV.toBeFeatures.indexOf('premiumSupport') == -1) {
            for (var i = 0; i < this.list.length; i++) {
              var item = this.list[i];
              if (item.plan) {
                item.plan_name = item.plan.name;
              } else if (item.has_pending_contracts) {
                item.plan_name = 'Pending';
              }
              this.setProjectCounters(item);
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
        setProjectCounters: function(project) {
          for (var i = 0; i < project.quotas.length; i++) {
            var quota = project.quotas[i];
            if (quota.name == 'nc_app_count') {
              project.app_count = quota.usage;
            } else if (quota.name == 'nv_vm_count') {
              project.vm_count = quota.usage;
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
      '$scope',
      '$interval',
      'ENV',
      'projectsService',
      'baseControllerDetailUpdateClass',
      'eventsService',
      'currentStateService',
      ProjectDetailUpdateController
    ]);

  function ProjectDetailUpdateController(
    $stateParams,
    $rootScope,
    $scope,
    $interval,
    ENV,
    projectsService,
    baseControllerDetailUpdateClass,
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
              countFieldKey: 'events'
            },
            {
              title: 'Alerts',
              key: 'alerts',
              viewName: 'tabAlerts',
              countFieldKey: 'alerts'
            },
            {
              title: 'VMs',
              key: ENV.resourcesTypes.vms,
              viewName: 'tabResources',
              countFieldKey: 'vms'
            },
            {
              title: 'Applications',
              key: ENV.resourcesTypes.applications,
              viewName: 'tabApplications',
              countFieldKey: 'apps'
            },
            {
              title: 'Backups',
              key: 'backups',
              viewName: 'tabBackups'
            },
            {
              title: 'People',
              key: 'people',
              viewName: 'tabUsers',
              countFieldKey: 'users'
            },
            {
              title: 'Support',
              key: 'premiumSupport',
              viewName: 'tabPremiumSupport',
              countFieldKey: 'premium_support_contracts'
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
        var timer = $interval(this.setCounters.bind(this), ENV.countersTimerInterval * 1000);
        $scope.$on('$destroy', function() {
          $interval.cancel(timer);
        });
      },
      getCounters: function() {
        var query = angular.extend(
            {UUID: this.model.uuid},
            eventsService.defaultFilter
        );
        return projectsService.getCounters(query);
      }
    });

    controllerScope.__proto__ = new Controller();
  }

})();
