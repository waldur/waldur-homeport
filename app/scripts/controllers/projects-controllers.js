'use strict';

(function() {
  angular.module('ncsaas')
    .service('BaseProjectListController', [
      'baseControllerListClass',
      'projectsService',
      'usersService',
      'currentStateService',
      '$rootScope',
      'ENV',
      'ENTITYLISTFIELDTYPES',
      BaseProjectListController]);

    function BaseProjectListController(
      baseControllerListClass,
      projectsService,
      usersService,
      currentStateService,
      $rootScope,
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
          if (ENV.featuresVisible || ENV.toBeFeatures.indexOf('appstore') == -1) {
            this.actionButtonsListItems.push({
              title: 'Create resource',
              clickFunction: function(project) {
                $rootScope.$broadcast('adjustCurrentProject', project);
                $state.go('appstore.store')
              }
            });
          }
          if (ENV.featuresVisible || ENV.toBeFeatures.indexOf('import') == -1) {
            this.actionButtonsListItems.push({
              title: 'Import resource',
              clickFunction: function(project) {
                $rootScope.$broadcast('adjustCurrentProject', project);
                $state.go('import.import')
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
        },
      });
      return controllerClass;
    }
})();

(function() {
  angular.module('ncsaas')
    .controller('ProjectListController',
      ['BaseProjectListController',
       'projectPermissionsService',
       'currentStateService',
       'resourcesService',
       '$rootScope',
       ProjectListController]);

  function ProjectListController(
    BaseProjectListController,
    projectPermissionsService,
    currentStateService,
    resourcesService,
    $rootScope) {
    var controllerScope = this;
    var Controller = BaseProjectListController.extend({
      projectUsers: {},
      projectResources: {},
      expandableResourcesKey: 'resources',
      expandableUsersKey: 'users',
      currentProject: null,

      init:function() {
        this.controllerScope = controllerScope;
        this.setSignalHandler('currentProjectUpdated', this.setCurrentProject.bind(controllerScope));
        this.setCurrentProject();
        this._super();
        this.entityOptions.expandable = true;

        this.expandableOptions = [
          {
            isList: true,
            sectionTitle: 'Resources',
            articleBlockText: 'New resources could be added through',
            entitiesLinkRef: 'appstore.store',
            entitiesLinkText: 'AppStore',
            addItemBlock: true,
            headBlock: 'heading',
            listKey: 'projectResources',
            modelId: 'uuid',
            minipaginationData:
            {
              pageChange: 'getResourcesForProject',
              pageEntityName: this.expandableResourcesKey
            },
            list: [
              {
                entityDetailsLink: 'resources.details({uuid: element.uuid})',
                entityDetailsLinkText: 'name',
                type: 'link'
              }
            ]
          },
          {
            isList: true,
            sectionTitle: 'Users',
            articleBlockText: 'Manage users through',
            entitiesLinkRef: 'projects.details({uuid: expandableElement.uuid})',
            entitiesLinkText: 'project details',
            addItemBlock: true,
            headBlock: 'heading',
            listKey: 'projectUsers',
            modelId: 'uuid',
            minipaginationData:
            {
              pageChange: 'getUsersForProject',
              pageEntityName: this.expandableUsersKey
            },
            list: [
              {
                avatarSrc: 'user_email',
                type: 'avatar'
              },
              {
                entityDetailsLink: 'users.details({uuid: element.user_uuid})',
                entityDetailsLinkText: 'user_full_name',
                type: 'link'
              }
            ]
          }
        ];
      },
      showMore: function(project) {
        if (!this.projectUsers[project.uuid]) {
          this.getUsersForProject(project.uuid);
        }
        if (!this.projectResources[project.uuid]) {
          this.getResourcesForProject(project.uuid);
        }
      },
      getUsersForProject: function(uuid, page) {
        var vm = this;
        var filter = {
          project:uuid
        };
        vm.projectUsers[uuid] = {data:null};
        page = page || 1;
        projectPermissionsService.page = page;
        projectPermissionsService.pageSize = 5;
        vm.projectUsers[uuid].page = page;
        projectPermissionsService.filterByCustomer = false;
        projectPermissionsService.getList(filter).then(function(response) {
          vm.projectUsers[uuid].data = response;
          vm.projectUsers[uuid].pages = projectPermissionsService.pages;
          $rootScope.$broadcast('mini-pagination:getNumberList', vm.projectUsers[uuid].pages,
            page, vm.getUsersForProject.bind(vm), vm.expandableUsersKey, uuid);
        });
      },
      getResourcesForProject: function(uuid, page) {
        var vm = this;
        var filter = {
          project_uuid:uuid
        };
        vm.projectResources[uuid] = {data:null};
        page = page || 1;
        resourcesService.page = page;
        resourcesService.pageSize = 5;
        vm.projectResources[uuid].page = page;
        resourcesService.filterByCustomer = false;
        resourcesService.getList(filter).then(function(response) {
          vm.projectResources[uuid].data = response;
          vm.projectResources[uuid].pages = resourcesService.pages;
          $rootScope.$broadcast('mini-pagination:getNumberList', vm.projectResources[uuid].pages,
            page, vm.getResourcesForProject.bind(vm), vm.expandableResourcesKey, uuid);
        });
      },
      setCurrentProject: function() {
        var vm = this;
        currentStateService.getProject().then(function(response) {
          vm.currentProject = response;
          if (response) {
            vm.entityOptions.list[0]['description'] =  {
              condition: vm.currentProject.uuid,
              text: '[Active]',
              field: 'uuid'
            };
          }
        });
      }
    });

    controllerScope.__proto__ = new Controller();
  }

  angular.module('ncsaas')
    .controller('ProjectAddController', ['projectsService', 'currentStateService',
      'cloudsService', 'projectCloudMembershipsService', 'baseControllerAddClass',
      '$rootScope', 'projectPermissionsService', 'usersService', ProjectAddController]);

  function ProjectAddController(
    projectsService, currentStateService, cloudsService, projectCloudMembershipsService, baseControllerAddClass,
    $rootScope, projectPermissionsService, usersService) {
    var controllerScope = this;
    var ProjectController = baseControllerAddClass.extend({
      userRole: 'admin',
      user: {},
      init: function() {
        this.service = projectsService;
        this.controllerScope = controllerScope;
        this.setSignalHandler('currentCustomerUpdated', this.currentCustomerUpdatedHandler.bind(this));
        this._super();
        this.listState = 'projects.list';
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
        cloudsService.getList().then(function(response) {
          for (var i = 0; response.length > i; i++) {
            projectCloudMembershipsService.addRow(vm.project.url, response[i].url);
          }
        });
        vm.addUser();
        $rootScope.$broadcast('refreshProjectList', {model: vm.instance, new: true, current: true});
      },
      currentCustomerUpdatedHandler: function() {
        var vm = this;
        vm.activate();
        /*jshint camelcase: false */
        if (vm.project.name || vm.project.description) {
          if (confirm('Clean all fields?')) {
            vm.project.name = '';
            vm.project.description = '';
          }
        }
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
      'ENV',
      'projectsService',
      'baseControllerDetailUpdateClass',
      'resourcesCountService',
      'currentStateService',
      'ENV',
      ProjectDetailUpdateController
    ]);

  function ProjectDetailUpdateController(
    $stateParams,
    $rootScope,
    ENV,
    projectsService,
    baseControllerDetailUpdateClass,
    resourcesCountService,
    currentStateService) {
    var controllerScope = this;
    var Controller = baseControllerDetailUpdateClass.extend({
      activeTab: 'eventlog',
      customer: null,
      canEdit: false,

      init:function() {
        this.service = projectsService;
        this.controllerScope = controllerScope;
        if (!$stateParams.uuid) {
          this.setSignalHandler('currentProjectUpdated', this.activate.bind(controllerScope));
        }
        this.setSignalHandler('refreshCounts', this.setCounters.bind(controllerScope));
        this._super();
        this.activeTab = (ENV.toBeFeatures.indexOf(this.activeTab) + 1) ? 'VMs' : this.activeTab;
        this.detailsViewOptions = {
          title: 'Project',
          activeTab: $stateParams.tab ? $stateParams.tab : this.activeTab,
          listState: $stateParams.uuid ? 'projects.list' : null,
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
              count: 0
            },
            {
              title: 'VMs',
              key: 'VMs',
              viewName: 'tabResources',
              count: 0
            },
            {
              title: 'Applications',
              key: 'applications',
              viewName: 'tabApplications',
              count: 0
            },
            {
              title: 'Backups',
              key: 'backups',
              viewName: 'tabBackups',
              count: 0
            },
            {
              title: 'People',
              key: 'people',
              viewName: 'tabUsers',
              count: 0
            },
            {
              title: 'Providers',
              key: 'providers',
              viewName: 'tabProviders',
              count: 0
            },
            {
              title: 'Support',
              key: 'premiumSupport',
              viewName: 'tabPremiumSupport',
              count: 0
            }
          ]
        };
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
      },
      setCounters: function() {
        this.setEventsCounter();
        this.setVmCounter();
        this.setAppCounter();
        this.setBackupsCounter();
        this.setProvidersCounter();
        this.setUsersCounter();
        this.setSupportCounter();
      },
      setEventsCounter: function() {
        var vm = this;
        resourcesCountService.events({'scope': vm.model.url}).then(function(response) {
          vm.detailsViewOptions.tabs[0].count = response;
        });
      },
      setVmCounter: function() {
        var vm = this;
        resourcesCountService.resources({
          'project_uuid': vm.model.uuid,
          'resource_type': ENV.resourceFilters.VMs
        }).then(function(response) {
          vm.detailsViewOptions.tabs[1].count = response;
        });
      },
      setAppCounter: function() {
        var vm = this;
        resourcesCountService.resources({
          'project_uuid': vm.model.uuid,
          'resource_type': ENV.resourceFilters.applications
        }).then(function(response) {
          vm.detailsViewOptions.tabs[2].count = response;
        });
      },
      setBackupsCounter: function() {
        var vm = this;
        if (ENV.featuresVisible || ENV.toBeFeatures.indexOf('backups') == -1) {
          resourcesCountService.backups({'project_uuid': vm.model.uuid}).then(function(response) {
            vm.detailsViewOptions.tabs[3].count = response;
          });
        }
      },
      setUsersCounter: function() {
        var vm = this;
        resourcesCountService.users({'project': vm.model.uuid}).then(function(response) {
          vm.detailsViewOptions.tabs[4].count = response;
        });
      },
      setProvidersCounter: function() {
        this.detailsViewOptions.tabs[5].count = this.model.services.length;
      },
      setSupportCounter: function() {
        var vm = this;
        if (ENV.featuresVisible || ENV.toBeFeatures.indexOf('premiumSupport') == -1) {
          resourcesCountService.premiumSupportContracts({
            project_uuid: vm.model.uuid
          }).then(function(response) {
            vm.detailsViewOptions.tabs[6].count = response;
          });
        }
      }
    });

    controllerScope.__proto__ = new Controller();
  }

})();

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

      init: function() {
        this.setSignalHandler('currentProjectUpdated', this.activate.bind(controllerScope));
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
    .controller('ProjectResourcesTabController', [
      '$stateParams',
      'BaseProjectResourcesTabController',
      'resourcesService',
      'currentStateService',
      ProjectResourcesTabController
    ]);

  function ProjectResourcesTabController(
    $stateParams,
    BaseProjectResourcesTabController,
    resourcesService,
    currentStateService
    ) {
    var controllerScope = this;
    var ResourceController = BaseProjectResourcesTabController.extend({
      init:function() {
        this.service = resourcesService;
        this.controllerScope = controllerScope;
        this.searchFilters = [
          {
            name: 'resource_type',
            title: 'OpenStack',
            value: 'OpenStack.Instance'
          },
          {
            name: 'resource_type',
            title: 'DigitalOcean',
            value: 'DigitalOcean.Droplet'
          },
          {
            name: 'resource_type',
            title: 'AWS EC2',
            value: 'Amazon.EC2'
          }
        ];
        if ($stateParams.uuid) {
          this.service.defaultFilter.project_uuid = $stateParams.uuid;
          this._super();
        } else {
          var fn = this._super.bind(this);
          var vm = this;
          this.setSignalHandler('currentProjectUpdated', this.currentProjectUpdate.bind(controllerScope));
          currentStateService.getProject().then(function(response) {
            vm.service.defaultFilter.project_uuid = response.uuid;
            fn();
          });
        }
      },
      currentProjectUpdate: function() {
        var vm = this;
        currentStateService.getProject().then(function(response) {
          vm.service.defaultFilter.project_uuid = response.uuid;
          vm.getList();
        });
      }
    });

    controllerScope.__proto__ = new ResourceController();
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
        if (!$stateParams.uuid) {
          this.setSignalHandler('currentProjectUpdated', this.getProject.bind(controllerScope));
        }
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
          projectsService.$get($stateParams.uuid).then(function(response) {
            vm.project = response;
            vm.getList();
          });
        } else {
          currentStateService.getProject().then(function(response) {
            vm.project = response;
            vm.getList();
          });
        }
      }
    });

    controllerScope.__proto__ = new EventController();
  }

})();

(function() {
  angular.module('ncsaas')
    .service('BaseProjectResourcesTabController', [
      'baseResourceListController',
      'resourcesService',
      BaseProjectResourcesTabController]);

    function BaseProjectResourcesTabController(
      baseResourceListController,
      resourcesService) {

      var controllerClass = baseResourceListController.extend({
        init: function() {
          this.service = resourcesService;

          this.service.defaultFilter['resource_type'] = [];
          for (var i = 0; i < this.searchFilters.length; i++) {
            var filter = this.searchFilters[i];
            this.service.defaultFilter[filter.name].push(filter.value);
          }

          this.selectAll = true;
          this._super();
        }
      });
      return controllerClass;
    }
})();

(function() {

  angular.module('ncsaas')
    .controller('ProjectApplicationsTabController', [
      'BaseProjectResourcesTabController', '$scope', 'currentStateService',
      ProjectApplicationsTabController]);

  function ProjectApplicationsTabController(BaseProjectResourcesTabController, $scope, currentStateService) {
    var controllerScope = this;
    var ResourceController = BaseProjectResourcesTabController.extend({
      init:function() {
        this.controllerScope = controllerScope;
        this.searchFilters = [
          {
            name: 'resource_type',
            title: 'Oracle',
            value: 'Oracle.Database'
          },
          {
            name: 'resource_type',
            title: 'GitLab',
            value: 'GitLab.Project'
          }
        ];
        this._super();

        this.entityOptions.entityData.noDataText = 'You have no applications yet';
        this.entityOptions.entityData.createLinkText = 'Create application';
        this.entityOptions.entityData.importLinkText = 'Import application';

        $scope.$on('currentProjectUpdated', this.setCurrentProject.bind(this));
        $scope.$on('searchInputChanged', this.onSearchInputChanged.bind(this));
      },

      registerEventHandlers: function() {},

      setCurrentProject: function() {
        this.getList();
      },

      getList: function(filter) {
        var vm = this;
        var fn = this._super.bind(vm);
        filter = filter || {};
        return currentStateService.getProject().then(function(project){
          filter['project_uuid'] = project.uuid;
          vm.service.defaultFilter.project_uuid = project.uuid;
          fn(filter);
        })
      },

      onSearchInputChanged: function(event, searchInput) {
        this.searchInput = searchInput;
        this.search();
      }
    });
    controllerScope.__proto__ = new ResourceController();
  }
})();

(function() {
angular.module('ncsaas')
  .controller('ProjectBackupsTabController', [
      'BaseBackupListController', '$scope', 'currentStateService',
      ProjectBackupsTabController
  ]);

  function ProjectBackupsTabController(BaseBackupListController, $scope, currentStateService) {
    var controllerScope = this;
      var Controller = BaseBackupListController.extend({
        init:function() {
          this.controllerScope = controllerScope;
          this._super();
          this.entityOptions.entityData.title = null;
          $scope.$on('currentProjectUpdated', this.setCurrentProject.bind(this));
          $scope.$on('searchInputChanged', this.onSearchInputChanged.bind(this));
        },

        registerEventHandlers: function() {},

        setCurrentProject: function() {
          this.getList();
        },

        getList: function(filter) {
          var vm = this;
          var fn = this._super.bind(vm);
          filter = filter || {};
          return currentStateService.getProject().then(function(project){
            filter['project_uuid'] = project.uuid;
            vm.service.defaultFilter.project_uuid = project.uuid;
            fn(filter);
          })
        },

        onSearchInputChanged: function(event, searchInput) {
          this.searchInput = searchInput;
          this.search();
        }
      });

    controllerScope.__proto__ = new Controller();
  }
})();

(function() {
  angular.module('ncsaas')
    .controller('ProjectServicesTabController',
      ['baseControllerListClass',
      'joinServiceProjectLinkService',
      'currentStateService',
      'ENTITYLISTFIELDTYPES',
      'ENV',
      '$scope',
      '$stateParams',
      'projectsService',
      'blockUI',
      '$rootScope',
      ProjectServicesTabController]);

  function ProjectServicesTabController(
    baseControllerListClass,
    joinServiceProjectLinkService,
    currentStateService,
    ENTITYLISTFIELDTYPES,
    ENV,
    $scope,
    $stateParams,
    projectsService,
    blockUI,
    $rootScope) {
    var controllerScope = this;
    var ServiceController = baseControllerListClass.extend({
      // TODO implement generalSearch when endpoint for mixed providers will be available NC-765
      init: function() {
        this.service = joinServiceProjectLinkService;
        this.controllerScope = controllerScope;
        this.setSignalHandler('currentProjectUpdated', this.setCurrentProject.bind(controllerScope));
        this._super();
        var currentCustomerUuid = currentStateService.getCustomerUuid();
        this.actionButtonsListItems = [
          {
            title: 'Remove',
            clickFunction: this.remove.bind(controllerScope)
          }
        ];
        this.entityOptions = {
          entityData: {
            noDataText: 'No providers yet',
            createLink: 'services.create',
            createLinkText: 'Create provider'
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
              link: 'organizations.details({uuid: "' + currentCustomerUuid
              + '", providerType: entity.type, providerUuid: entity.uuid, tab: "providers"})',
              className: 'name'
            },
            {
              name: 'Type',
              propertyName: 'type',
              type: ENTITYLISTFIELDTYPES.noType
            },
            {
              name: 'Resources',
              propertyName: 'resources_count',
              emptyText: '0'
            }
          ]
        };


        $scope.$on('searchInputChanged', this.onSearchInputChanged.bind(this));
      },

      setCurrentProject: function() {
        this.getList();
      },

      getList: function(filter) {
        var vm = this;
        var fn = this._super.bind(controllerScope);
        var projectMenu = blockUI.instances.get('tab-content');
        projectMenu.start();
        if ($stateParams.uuid) {
          return projectsService.$get($stateParams.uuid).then(function(project) {
            vm.service.defaultFilter.project_uuid = project.uuid;
            fn(filter).then(function() {
              projectMenu.stop();
            });
          });
        } else {
          return currentStateService.getProject().then(function(project) {
            vm.service.defaultFilter.project_uuid = project.uuid;
            fn(filter).then(function() {
              projectMenu.stop();
            });
          });
        }
      },
      removeInstance: function(model) {
        return joinServiceProjectLinkService.$deleteByUrl(model.url);
      },
      afterInstanceRemove: function(instance) {
        $rootScope.$broadcast('refreshProjectList');
        this._super(instance);
      },
      onSearchInputChanged: function(event, searchInput) {
        this.searchInput = searchInput;
        this.search();
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
    $stateParams
    ) {
    var controllerScope = this;
    var ResourceController = baseControllerListClass.extend({
      init: function() {
        this.controllerScope = controllerScope;
        this.service = premiumSupportContractsService;
        if (!$stateParams.uuid) {
          this.setSignalHandler('currentProjectUpdated', this.setCurrentProject.bind(controllerScope));
        }
        this._super();

        this.entityOptions = {
          entityData: {
            noDataText: 'You have no SLAs yet.',
            createLink: 'appstore.store({category: "support"})',
            createLinkText: 'Add SLA',
            expandable: true
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
      setCurrentProject: function() {
        this.getList();
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
        premiumSupportPlansService.$get(null, contract.plan).then(function(response) {
          contract.plan_description = response.description;
          contract.plan_terms = response.terms;
          contract.plan_base_rate = $filter('currency')(response.base_rate, ENV.currency);
          contract.plan_hour_rate = $filter('currency')(response.hour_rate, ENV.currency);
        })
      }
    });

    controllerScope.__proto__ = new ResourceController();
  }

})();
