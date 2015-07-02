'use strict';

(function() {
  angular.module('ncsaas')
    .controller('ProjectListController',
      ['baseControllerListClass', 'projectsService', 'projectPermissionsService', 'resourcesService', '$scope', ProjectListController]);

  function ProjectListController(baseControllerListClass, projectsService, projectPermissionsService, resourcesService, $scope) {
    var controllerScope = this;
    var CustomerController = baseControllerListClass.extend({
      projectUsers: {},
      projectResources: {},

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
          $scope.$broadcast('mini-pagination:getNumberList', vm.projectUsers[uuid].pages,
            page, vm.getUsersForProject.bind(vm), 'users', uuid);
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
          $scope.$broadcast('mini-pagination:getNumberList', vm.projectResources[uuid].pages,
            page, vm.getResourcesForProject.bind(vm), 'resources', uuid);
        });
      }
    });

    controllerScope.__proto__ = new CustomerController();
  }

  angular.module('ncsaas')
    .controller('ProjectAddController', ['projectsService', 'currentStateService',
      'servicesService', 'projectCloudMembershipsService', 'baseControllerAddClass', ProjectAddController]);

  function ProjectAddController(
    projectsService, currentStateService, servicesService, projectCloudMembershipsService, baseControllerAddClass) {
    var controllerScope = this;
    var ProjectController = baseControllerAddClass.extend({
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
      },
      afterSave: function() {
        var vm = this;
        servicesService.filterByCustomer = false;
        servicesService.getList().then(function(response) {
          for (var i = 0; response.length > i; i++) {
            projectCloudMembershipsService.addRow(vm.project.url, response[i].url);
          }
        });
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
      }
    });

    controllerScope.__proto__ = new ProjectController();
  }

  angular.module('ncsaas')
    .controller('ProjectDetailUpdateController', [
      '$stateParams',
      'projectsService',
      'baseControllerDetailUpdateClass',
      ProjectDetailUpdateController
    ]);

  function ProjectDetailUpdateController($stateParams, projectsService, baseControllerDetailUpdateClass) {
    var controllerScope = this;
    var Controller = baseControllerDetailUpdateClass.extend({
      activeTab: 'eventlog',
      customer: null,

      init:function() {
        this.service = projectsService;
        this.controllerScope = controllerScope;
        this._super();
        this.detailsState = 'projects.details';
        this.activeTab = $stateParams.tab ? $stateParams.tab : this.activeTab;
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
        this.service.defaultFilter.project = $stateParams.uuid;
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
          this.service.defaultFilter.search = this.project.name;
          this._super(filter);
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
      'servicesService',
      ProjectServiceTabController
    ]);

  function ProjectServiceTabController(
    $stateParams, projectsService, baseControllerClass, projectCloudMembershipsService, servicesService) {
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
        servicesService.getList(filter).then(function(response) {
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
