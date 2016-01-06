(function() {
  angular.module('ncsaas')
    .controller('ProjectUsersTabController', [
      '$stateParams',
      'projectsService',
      'projectPermissionsService',
      'USERPROJECTROLE',
      'usersService',
      'baseControllerClass',
      'currentStateService',
      ProjectUsersTabController
    ]);

  function ProjectUsersTabController(
    $stateParams, projectsService, projectPermissionsService, USERPROJECTROLE, usersService, baseControllerClass,
    currentStateService) {
    var controllerScope = this;
    var Controller = baseControllerClass.extend({
      users: {}, // users with role in project
      usersListForAutoComplete: [],
      user: null,
      project: null,
      checkQuotas: 'user',

      init: function() {
        this.blockUIElement = 'tab-content';
        this._super();
        this.adminRole = USERPROJECTROLE.admin;
        this.managerRole = USERPROJECTROLE.manager;
        this.users[this.adminRole] = [];
        this.users[this.managerRole] = [];
        this.activate();
      },
      activate: function() {
        var vm = this;

        if ($stateParams.uuid) {
          projectsService.$get($stateParams.uuid).then(function(response) {
            vm.project = response;
            vm.getUsers();
          });
        } else {
          currentStateService.getProject().then(function(response) {
            vm.project = response;
            vm.getUsers();
          });
        }

        this.getUserListForAutoComplete();
      },
      getUsers: function() {
        this.getUsersForProject(this.adminRole);
        this.getUsersForProject(this.managerRole);
      },
      getUserListForAutoComplete: function(filter) {
        var vm = this;
        filter = filter || {};
        filter['DONTBLOCK'] = 1;
        usersService.getList(filter).then(function(response) {
          vm.usersListForAutoComplete = response;
        });
      },
      getUsersForProject: function(role) {
        var vm = this;
        var filter = {
          role: role,
          project: vm.project.uuid
        };
        projectPermissionsService.getList(filter).then(function(response) {
          vm.users[role] = response;
        });
      },
      userSearchInputChanged: function(searchText) {
        controllerScope.getUserListForAutoComplete({full_name: searchText});
      },
      selectedUsersCallback: function(selected) {
        if (selected) {
          controllerScope.user = selected.originalObject;
          controllerScope.addUser(this.id);
          controllerScope.getUserListForAutoComplete();
        }
      },
      addUser: function(role) {
        var vm = this;
        var instance = projectPermissionsService.$create();
        instance.user = vm.user.url;
        instance.project = vm.project.url;
        instance.role = role;
        instance.$save(
          function() {
            vm.getUsersForProject(role);
          },
          function(response) {
            alert(response.data.non_field_errors);
          }
        );
      },
      userProjectRemove: function(userProject) {
        var vm = this;
        var role = userProject.role;
        var index = vm.users[role].indexOf(userProject);
        var confirmDelete = confirm('Confirm user deletion?');
        if (confirmDelete) {
          projectPermissionsService.$delete(userProject.pk).then(
            function() {
              vm.users[role].splice(index, 1);
            },
            function(response) {
              alert(response.data.detail);
            }
          );
        } else {
          alert('User was not deleted.');
        }
      }
    });

    controllerScope.__proto__ = new Controller();
  }

})();

(function() {
  angular.module('ncsaas')
    .controller('ProjectEventTabController', [
      '$stateParams',
      'projectsService',
      'baseEventListController',
      'currentStateService',
      ProjectEventTabController
    ]);

  function ProjectEventTabController($stateParams, projectsService, baseEventListController, currentStateService) {
    var controllerScope = this;
    var EventController = baseEventListController.extend({
      project: null,

      init: function() {
        this.controllerScope = controllerScope;
        this.blockUIElement = 'tab-content';
        this._super();
        this.getProject();
      },
      getList: function(filter) {
        if (this.project) {
          this.service.defaultFilter.scope = this.project.url;
          return this._super(filter);
        } else {
          return this.getProject();
        }
      },
      getProject: function() {
        var vm = this;
        if ($stateParams.uuid) {
          return projectsService.$get($stateParams.uuid).then(function(response) {
            vm.project = response;
            return vm.getList();
          });
        } else {
          return currentStateService.getProject().then(function(response) {
            vm.project = response;
            return vm.getList();
          });
        }
      }
    });

    controllerScope.__proto__ = new EventController();
  }

})();

(function() {
  angular.module('ncsaas')
    .controller('ProjectAlertTabController', [
      'BaseAlertsListController',
      'currentStateService',
      ProjectAlertTabController
    ]);

  function ProjectAlertTabController(
    BaseAlertsListController,
    currentStateService
  ) {
    var controllerScope = this;
    var AlertController = BaseAlertsListController.extend({
      init: function() {
        this.controllerScope = controllerScope;
        this.blockUIElement = 'tab-content';
        this._super();
      },
      getList: function(filter) {
        var getList = this._super.bind(controllerScope),
          vm = this;
        this.service.defaultFilter.aggregate = 'project';
        this.service.defaultFilter.opened = true;
        return currentStateService.getProject().then(function(response) {
          vm.service.defaultFilter.uuid = response.uuid;
          return getList(filter);
        });
      }
    });

    controllerScope.__proto__ = new AlertController();
  }

})();

(function() {
  angular.module('ncsaas')
    .service('BaseProjectResourcesTabController', [
      'baseResourceListController', 'currentStateService', BaseProjectResourcesTabController]);

  function BaseProjectResourcesTabController(baseResourceListController, currentStateService) {
    var controllerClass = baseResourceListController.extend({
      getList: function(filter) {
        var vm = this;
        var fn = this._super.bind(vm);
        return currentStateService.getProject().then(function(project){
          vm.service.defaultFilter.project_uuid = project.uuid;
          return fn(filter);
        })
      }
    });
    return controllerClass;
  }
})();

(function() {
  angular.module('ncsaas')
    .controller('ProjectResourcesTabController', [
      'BaseProjectResourcesTabController',
      'ENV',
      ProjectResourcesTabController
    ]);

  function ProjectResourcesTabController(BaseProjectResourcesTabController, ENV) {
    var controllerScope = this;
    var ResourceController = BaseProjectResourcesTabController.extend({
      init: function() {
        this.controllerScope = controllerScope;
        this.category = ENV.VirtualMachines;
        this._super();
        this.entityOptions.entityData.noMatchesText = 'No VMs found matching filter.';
      }
    });
    controllerScope.__proto__ = new ResourceController();
  }
})();

(function() {

  angular.module('ncsaas')
    .controller('ProjectApplicationsTabController', [
      'BaseProjectResourcesTabController', 'ENV',
      ProjectApplicationsTabController]);

  function ProjectApplicationsTabController(BaseProjectResourcesTabController, ENV) {
    var controllerScope = this;
    var ResourceController = BaseProjectResourcesTabController.extend({
      init:function() {
        this.controllerScope = controllerScope;
        this.category = ENV.Applications;
        this._super();

        this.entityOptions.entityData.noDataText = 'You have no applications yet';
        this.entityOptions.entityData.createLinkText = 'Create application';
        this.entityOptions.entityData.importLinkText = 'Import application';
        this.entityOptions.entityData.noMatchesText = 'No applications found matching filter.';
      }
    });
    controllerScope.__proto__ = new ResourceController();
  }
})();

(function() {
  angular.module('ncsaas')
    .controller('ProjectServicesTabController',
    ['baseControllerListClass',
      'joinServiceProjectLinkService',
      'joinService',
      'currentStateService',
      'ENTITYLISTFIELDTYPES',
      '$rootScope',
      ProjectServicesTabController]);

  function ProjectServicesTabController(
    baseControllerListClass,
    joinServiceProjectLinkService,
    joinService,
    currentStateService,
    ENTITYLISTFIELDTYPES,
    $rootScope) {
    var controllerScope = this;
    var ServiceController = baseControllerListClass.extend({
      init: function() {
        this.service = joinService;
        this.service.defaultFilter.project_uuid = currentStateService.getProjectUuid();
        this.controllerScope = controllerScope;
        this.blockUIElement = 'tab-content';
        this._super();
        this.actionButtonsListItems = [
          {
            title: 'Remove',
            clickFunction: this.remove.bind(controllerScope),

            isDisabled: function(service) {
              return service.shared || service.resources_count > 0;
            }.bind(this.controllerScope),

            tooltip: function(service) {
              if (service.shared) {
                return 'You cannot remove shared provider';
              }
              if (service.resources_count) {
                return 'Provider has resources. Remove them first';
              }
            }.bind(this.controllerScope)
          }
        ];
        this.entityOptions = {
          entityData: {
            noDataText: 'No providers yet',
            createLink: 'services.create',
            createLinkText: 'Create provider',
            checkQuotas: 'service'
          },
          list: [
            {
              type: ENTITYLISTFIELDTYPES.statusCircle,
              className: 'statusCircle',
              propertyName: 'state',
              onlineStatus: 'In Sync'
            },
            {
              name: 'Name',
              propertyName: 'name',
              type: ENTITYLISTFIELDTYPES.name,
              link: 'organizations.details({uuid: "' + currentStateService.getCustomerUuid()
              + '", providerType: entity.service_type, providerUuid: entity.uuid, tab: "providers"})',
              className: 'name',
              showForMobile: true
            },
            {
              name: 'Type',
              propertyName: 'service_type',
              type: ENTITYLISTFIELDTYPES.noType
            },
            {
              name: 'Resources',
              propertyName: 'resources_count',
              emptyText: '0'
            }
          ]
        };
      },
      getList: function(filter) {
        return this._super(filter);
      },
      removeInstance: function(model) {
        return joinServiceProjectLinkService.$deleteByUrl(model.url);
      },
      afterInstanceRemove: function(instance) {
        $rootScope.$broadcast('refreshProjectList');
        this._super(instance);
      }
    });

    controllerScope.__proto__ = new ServiceController();
  }
})();

(function() {
  angular.module('ncsaas')
    .controller('ProjectSupportTabController', [
      'baseControllerListClass',
      'premiumSupportContractsService',
      'premiumSupportPlansService',
      'currentStateService',
      'ENTITYLISTFIELDTYPES',
      'ENV',
      '$filter',
      '$stateParams',
      'ncUtils',
      ProjectSupportTabController
    ]);

  function ProjectSupportTabController(
    baseControllerListClass,
    premiumSupportContractsService,
    premiumSupportPlansService,
    currentStateService,
    ENTITYLISTFIELDTYPES,
    ENV,
    $filter,
    $stateParams,
    ncUtils
  ) {
    var controllerScope = this;
    var ResourceController = baseControllerListClass.extend({
      init: function() {
        this.controllerScope = controllerScope;
        this.service = premiumSupportContractsService;
        this.blockUIElement = 'tab-content';
        this._super();

        this.entityOptions = {
          entityData: {
            noDataText: 'You have no SLAs yet.',
            createLink: 'appstore.store({category: "support"})',
            createLinkText: 'Add SLA',
            expandable: true,
            hideActionButtons: true
          },
          list: [
            {
              name: 'Name',
              propertyName: 'plan_name',
              type: ENTITYLISTFIELDTYPES.none,
              showForMobile: ENTITYLISTFIELDTYPES.showForMobile
            },
            {
              name: 'State',
              propertyName: 'state',
              type: ENTITYLISTFIELDTYPES.none,
              showForMobile: ENTITYLISTFIELDTYPES.showForMobile
            }
          ]
        };
        this.expandableOptions = [
          {
            isList: false,
            addItemBlock: false,
            viewType: 'description',
            items: [
              {
                key: 'plan_description',
                label: 'Description'
              },
              {
                key: 'plan_base_rate',
                label: 'Base rate'
              },
              {
                key: 'plan_hour_rate',
                label: 'Hour rate'
              },
              {
                key: 'plan_terms',
                label: 'Terms'
              }
            ]
          }
        ];
      },
      getList: function(filter) {
        var vm = this;
        var fn = this._super.bind(vm);
        if ($stateParams.uuid) {
          this.service.defaultFilter.project_uuid = $stateParams.uuid;
          return fn(filter);
        }
        return currentStateService.getProject().then(function(project) {
          vm.service.defaultFilter.project_uuid = project.uuid;
          return fn(filter);
        })
      },
      showMore: function(contract) {
        var promise = premiumSupportPlansService.$get(null, contract.plan).then(function(response) {
          contract.plan_description = response.description;
          contract.plan_terms = response.terms;
          contract.plan_base_rate = $filter('currency')(response.base_rate, ENV.currency);
          contract.plan_hour_rate = $filter('currency')(response.hour_rate, ENV.currency);
        });
        ncUtils.blockElement('block_'+contract.uuid, promise);
      }
    });

    controllerScope.__proto__ = new ResourceController();
  }

})();

(function() {
  angular.module('ncsaas')
    .controller('ProjectDeleteTabController', [
      'baseControllerClass',
      'projectsService',
      'currentStateService',
      '$rootScope',
      '$state',
      '$window',
      ProjectDeleteTabController
    ]);

  function ProjectDeleteTabController(
    baseControllerClass,
    projectsService,
    currentStateService,
    $rootScope,
    $state,
    $window
  ) {
    var controllerScope = this;
    var DeleteController = baseControllerClass.extend({
      init: function() {
        this.controllerScope = controllerScope;
        this.service = projectsService;
        this._super();

        var vm = this;
        currentStateService.getProject().then(function(project) {
          vm.project = project;
        });
      },
      removeProject: function () {
        var confirmDelete = confirm('Confirm deletion?');
        if (confirmDelete) {
          this.project.$delete().then(function() {
            projectsService.clearAllCacheForCurrentEndpoint();
            return projectsService.getFirst().then(function(project) {
              currentStateService.setProject(project);
              $rootScope.$broadcast('refreshProjectList', {model: controllerScope.project, remove: true});
            });
          }).then(function() {
            currentStateService.getCustomer().then(function(customer) {
              $state.go('organizations.details', {uuid: customer.uuid, tab: 'projects'}, {notify: false});
              $window.location.reload();
            });
          });
        }
      }
    });

    controllerScope.__proto__ = new DeleteController();
  }

})();
