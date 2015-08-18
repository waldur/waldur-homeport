'use strict';

(function() {
  angular.module('ncsaas')
    .controller('ProjectListController',
      ['baseControllerListClass', 'projectsService', 'projectPermissionsService', 'resourcesService',
        '$rootScope', 'ENTITYLISTFIELDTYPES', ProjectListController]);

  function ProjectListController(
    baseControllerListClass, projectsService, projectPermissionsService, resourcesService, $rootScope, ENTITYLISTFIELDTYPES) {
    var controllerScope = this;
    var CustomerController = baseControllerListClass.extend({
      projectUsers: {},
      projectResources: {},
      expandableResourcesKey: 'resources',
      expandableUsersKey: 'users',

      init:function() {
        this.service = projectsService;
        this.controllerScope = controllerScope;
        this._super();
        this.searchFieldName = 'name';
        this.actionButtonsListItems = [
          {
            title: 'Archive',
            clickFunction: function(project) {}
          },
          {
            title: 'Delete',
            clickFunction: this.remove.bind(controllerScope)
          }
        ];
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
      afterInstanceRemove: function(instance) {
        $rootScope.$broadcast('refreshProjectList', {model: instance});
        this._super(instance);
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
          project:uuid
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
      }
    });

    controllerScope.__proto__ = new CustomerController();
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
        cloudsService.filterByCustomer = false;
        cloudsService.getList().then(function(response) {
          for (var i = 0; response.length > i; i++) {
            projectCloudMembershipsService.addRow(vm.project.url, response[i].url);
          }
        });
        vm.addUser();
        $rootScope.$broadcast('refreshProjectList', {model: vm.instance});
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
      'projectsService',
      'baseControllerDetailUpdateClass',
      'resourcesCountService',
      '$q',
      "$rootScope",
      ProjectDetailUpdateController
    ]);

  function ProjectDetailUpdateController($stateParams, projectsService, baseControllerDetailUpdateClass,
                                         resourcesCountService, $q, $rootScope) {
    var controllerScope = this;
    var Controller = baseControllerDetailUpdateClass.extend({
      activeTab: 'eventlog',
      customer: null,
      canEdit: false,

      init:function() {
        this.service = projectsService;
        this.controllerScope = controllerScope;
        this._super();
        this.detailsState = 'projects.details';
        this.detailsViewOptions = {
          title: 'Project',
          activeTab: $stateParams.tab ? $stateParams.tab : this.activeTab,
          listState: 'projects.list',
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
              title: 'Resources',
              key: 'resources',
              viewName: 'tabResources',
              count: 0
            },
            {
              title: 'Users',
              key: 'users',
              viewName: 'tabUsers',
              count: 0
            },
            {
              title: 'Services',
              key: 'services',
              viewName: 'tabServices',
              count: 0
            }
          ]
        };
      },
      afterActivate: function() {
        var vm = controllerScope;
        vm.canEdit = vm.model;
        $q.all([
          resourcesCountService.events({'scope': vm.model.url}),
          resourcesCountService.resources({'project_uuid': vm.model.uuid}),
          resourcesCountService.users({'project': vm.model.uuid}),
          resourcesCountService.projectCloud({'project': vm.model.uuid})
        ]).then(function(responses) {
          vm.detailsViewOptions.tabs[0].count = responses[0];
          vm.detailsViewOptions.tabs[1].count = responses[1];
          vm.detailsViewOptions.tabs[2].count = responses[2];
          vm.detailsViewOptions.tabs[3].count = responses[3];
        });
      },
      afterUpdate: function() {
        $rootScope.$broadcast('refreshProjectList', {model: this.model, update: true});
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
      ProjectUsersTabController
    ]);

  function ProjectUsersTabController(
    $stateParams, projectsService, projectPermissionsService, USERPROJECTROLE, usersService, baseControllerClass) {
    var controllerScope = this;
    var Controller = baseControllerClass.extend({
      users: {}, // users with role in project
      usersListForAutoComplete: [],
      user: null,
      project: null,

      init: function() {
        this._super();
        this.adminRole = USERPROJECTROLE.admin;
        this.managerRole = USERPROJECTROLE.manager;
        this.users[this.adminRole] = [];
        this.users[this.managerRole] = [];
        this.activate();
      },
      activate: function() {
        var vm = this;
        if (this.users[this.adminRole].length === 0) {
          this.getUsersForProject(this.adminRole);
        }
        if (this.users[this.managerRole].length === 0) {
          this.getUsersForProject(this.managerRole);
        }
        projectsService.$get($stateParams.uuid).then(function(response) {
          vm.project = response;
        });
        this.getUserListForAutoComplete();
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
          project: $stateParams.uuid
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
      'baseResourceListController',
      'resourcesService',
      ProjectResourcesTabController
    ]);

  function ProjectResourcesTabController(
    $stateParams,
    baseResourceListController,
    resourcesService
    ) {
    var controllerScope = this;
    var ResourceController = baseResourceListController.extend({
      init:function() {
        this.service = resourcesService;
        this.controllerScope = controllerScope;
        this.service.defaultFilter.project_uuid = $stateParams.uuid;
        this.searchFilters = [
          {
            name: 'resource_type',
            title: 'OpenStack',
            value: 'IaaS.Instance'
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
        this._super();
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
      ProjectEventTabController
    ]);

  function ProjectEventTabController($stateParams, projectsService, baseEventListController) {
    var controllerScope = this;
    var EventController = baseEventListController.extend({
      project: null,

      init: function() {
        this.controllerScope = controllerScope;
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
        projectsService.$get($stateParams.uuid).then(function (response) {
          vm.project = response;
          vm.getList();
        });
      }
    });

    controllerScope.__proto__ = new EventController();
  }

})();


(function() {
  angular.module('ncsaas')
    .controller('ProjectServiceTabController', [
      '$stateParams',
      'projectsService',
      'baseControllerClass',
      'projectCloudMembershipsService',
      'cloudsService',
      ProjectServiceTabController
    ]);

  function ProjectServiceTabController(
    $stateParams, projectsService, baseControllerClass, projectCloudMembershipsService, cloudsService) {
    var controllerScope = this;
    var Controller = baseControllerClass.extend({
      project: null,
      projectServices: [],
      servicesListForAutoComplete: [],
      selectedService: null,

      init: function() {
        this._super();
        this.activate();
      },
      activate: function() {
        var vm = this;
        projectsService.$get($stateParams.uuid).then(function(response) {
          vm.project = response;
        });
        vm.getProjectServices();
        vm.getServicesListForAutoComplete();
      },
      getProjectServices: function() {
        var vm = this;
        projectCloudMembershipsService.getList({project: $stateParams.uuid}).then(function(response) {
          vm.projectServices = response;
        });
      },
      getServicesListForAutoComplete: function(filter) {
        var vm = this;
        cloudsService.getList(filter).then(function(response) {
          vm.servicesListForAutoComplete = response;
        });
      },
      serviceSearchInputChanged: function(searchText) {
        controllerScope.getServicesListForAutoComplete({name: searchText});
      },
      selectedServicesCallback: function(selected) {
        if (selected) {
          controllerScope.selectedService = selected.originalObject;
          controllerScope.addService();
          controllerScope.getServicesListForAutoComplete();
        }
      },
      addService: function() {
        var vm = this;
        var instance = projectCloudMembershipsService.$create();
        instance.cloud = vm.selectedService.url;
        instance.project = vm.project.url;
        instance.$save(
          function() {
            vm.getProjectServices();
          },
          function(response) {
            alert(response.data.non_field_errors);
          }
        );
      },
      projectServiceRemove: function(projectService) {
        var vm = this;
        var index = vm.projectServices.indexOf(projectService);
        var confirmDelete = confirm('Confirm service deletion?');
        if (confirmDelete) {
          projectService.$delete().then(
            function() {
              vm.projectServices.splice(index, 1);
            },
            function(response) {
              alert(response.data.detail);
            }
          );
        } else {
          alert('Service was not deleted.');
        }
      }
    });

    controllerScope.__proto__ = new Controller();
  }
})();


(function() {
  angular.module('ncsaas')
    .controller('ProjectStatsController', [
      '$scope',
      '$rootScope',
      '$q',
      'currentStateService',
      'resourcesCountService',
      '$stateParams',
      ProjectStatsController]);

    function ProjectStatsController($scope, $rootScope, $q, currentStateService, resourcesCountService, $stateParams) {
      $scope.search = function() {
        $rootScope.$broadcast('searchInputChanged', $scope.searchText);
      };

      $scope.activeTab = $stateParams.tab ? $stateParams.tab : 'VMs';

      setCurrentProject();
      $scope.$on('currentProjectUpdated', setCurrentProject);

      function setCurrentProject() {
        currentStateService.getProject().then(function(project) {
          $q.all([
            resourcesCountService.resources({'project_uuid': project.uuid, 'resource_type': ['DigitalOcean.Droplet', 'IaaS.Instance']}),
            resourcesCountService.resources({'project_uuid': project.uuid, 'resource_type': ['Oracle.Database', 'GitLab.Project']}),
            resourcesCountService.backups({'project_uuid': project.uuid}),
            resourcesCountService.users({'project': project.uuid}),
          ]).then(function(responses) {
            $scope.count = {};
            $scope.count.vms = responses[0];
            $scope.count.apps = responses[1];
            $scope.count.backups = responses[2];
            $scope.count.users = responses[3];
            $scope.count.services = project.services.length;
          })
        });
      }
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
    .controller('ResourceProjectsTabController', [
      'BaseProjectResourcesTabController',
      'currentStateService',
      '$scope',
      ResourceProjectsTabController]);

  function ResourceProjectsTabController(BaseProjectResourcesTabController, currentStateService, $scope) {
    var controllerScope = this;
    var ResourceController = BaseProjectResourcesTabController.extend({
      init:function() {
        this.controllerScope = controllerScope;
        this.searchFilters = [
          {
            name: 'resource_type',
            title: 'OpenStack',
            value: 'IaaS.Instance'
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
        this.searchFieldName = 'name';
        this._super();

        this.entityOptions.entityData.noDataText = 'You have no VMs yet';
        this.entityOptions.entityData.createLinkText = 'Create VM';
        this.entityOptions.entityData.importLinkText = 'Import VM';

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
        });
      },

      onSearchInputChanged: function(event, searchInput) {
        this.searchInput = searchInput;
        this.search();
      }
    });

    controllerScope.__proto__ = new ResourceController();
  }

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
    .controller('ResourceProjectUsersTabController', [
      '$scope',
      'currentStateService',
      'projectsService',
      'projectPermissionsService',
      'USERPROJECTROLE',
      'usersService',
      'baseControllerClass',
      ResourceProjectUsersTabController
    ]);

  function ResourceProjectUsersTabController(
    $scope,
    currentStateService,
    projectsService,
    projectPermissionsService,
    USERPROJECTROLE,
    usersService,
    baseControllerClass) {
    var controllerScope = this;
    var Controller = baseControllerClass.extend({
      users: {}, // users with role in project
      usersListForAutoComplete: [],
      user: null,
      project: null,

      init: function() {
        this._super();
        this.adminRole = USERPROJECTROLE.admin;
        this.managerRole = USERPROJECTROLE.manager;
        this.users[this.adminRole] = [];
        this.users[this.managerRole] = [];
        this.activate();
        $scope.$on('currentProjectUpdated', this.setCurrentProject.bind(this));
      },

      registerEventHandlers: function() {},

      setCurrentProject: function() {
        this.activate();
      },

      activate: function() {
        var vm = this;
        currentStateService.getProject().then(function(project){
          vm.project = project;
          vm.getUsersForProject(vm.adminRole);
          vm.getUsersForProject(vm.managerRole);
        });
        this.getUserListForAutoComplete();
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
        projectPermissionsService.getList({
          role: role,
          project: vm.project.uuid
        }).then(function(response) {
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
    .controller('ProjectServicesTabController',
      ['baseControllerListClass',
      'joinServiceProjectLinkService',
      'currentStateService',
      'ENTITYLISTFIELDTYPES',
      'ENV',
      '$scope',
      ProjectServicesTabController]);

  function ProjectServicesTabController(
    baseControllerListClass,
    joinServiceProjectLinkService,
    currentStateService,
    ENTITYLISTFIELDTYPES,
    ENV,
    $scope) {
    var controllerScope = this;
    var ServiceController = baseControllerListClass.extend({
      init: function() {
        this.service = joinServiceProjectLinkService;
        this.controllerScope = controllerScope;
        this._super();

        this.entityOptions = {
          entityData: {
            noDataText: 'No providers yet',
            createLink: 'services.create',
            createLinkText: 'Create provider',
          },
          list: [
            {
              type: ENTITYLISTFIELDTYPES.statusCircle,
              className: 'statusCircle',
              propertyName: 'state',
              onlineStatus: ENV.resourceOnlineStatus
            },
            {
              name: 'Name',
              propertyName: 'name',
              type: ENTITYLISTFIELDTYPES.name,
              link: 'services.details({uuid: entity.uuid, provider: entity.type})',
              className: 'name'
            },
            {
              name: 'Type',
              propertyName: 'type',
              type: ENTITYLISTFIELDTYPES.noType
            }
          ]
        };

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

    controllerScope.__proto__ = new ServiceController();
  }
})();
