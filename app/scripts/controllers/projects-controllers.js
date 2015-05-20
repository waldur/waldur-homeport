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
    .controller('ProjectAddController', ['$state', 'projectsService',
      'currentStateService', 'servicesService', 'projectCloudMembershipsService', ProjectAddController]);

  function ProjectAddController(
    $state, projectsService, currentStateService, servicesService, projectCloudMembershipsService) {
    var vm = this;

    vm.project = projectsService.$create();
    vm.save = save;

    function save() {
      // TODO: refactor this function to use named urls and uuid field instead - SAAS-108
      currentStateService.getCustomer().then(function(customer) {
        vm.project.customer = customer.url;

        vm.project.$save(function() {
          var url = vm.project.url,
            array = url.split ('/').filter(function(el) {
              return el.length !== 0;
            }),
            uuidNew = array[4];
          servicesService.filterByCustomer = false;
          servicesService.getList().then(function(response) {
            for (var i = 0; response.length > i; i++) {
              projectCloudMembershipsService.addRow(vm.project.url, response[i].url);
            }
          });
          $state.go('projects.details', {uuid:uuidNew});
        }, function(response) {
          vm.errors = response.data;
        });
      });
    }

  }

  angular.module('ncsaas')
    .controller('ProjectDetailUpdateController', [
      '$stateParams',
      'projectsService',
      'projectPermissionsService',
      'USERPROJECTROLE',
      'usersService',
      ProjectDetailUpdateController
    ]);

  function ProjectDetailUpdateController(
    $stateParams, projectsService, projectPermissionsService, USERPROJECTROLE, usersService) {
    var vm = this;

    vm.activeTab = $stateParams.tab ? $stateParams.tab : 'eventlog';
    vm.project = null;
    projectsService.$get($stateParams.uuid).then(function(response) {
      vm.project = response;
    });
    vm.update = update;

    // users tab
    vm.adminRole = USERPROJECTROLE.admin;
    vm.managerRole = USERPROJECTROLE.manager;
    vm.users = {};
    vm.users[vm.adminRole] = [];
    vm.users[vm.managerRole] = [];
    vm.activateUserTab = activateUserTab;
    vm.usersList = [];
    vm.userSearchInputChanged = userSearchInputChanged;
    vm.selectedUsersCallback = selectedUsersCallback;
    vm.user = null;
    vm.userProjectRemove = userProjectRemove;

    function getUserList(filter) {
      usersService.getList(filter).then(function(response) {
        vm.usersList = response;
      });
    }

    if (vm.activeTab === 'users') {
      activateUserTab();
    }

    function activateUserTab() {
      if (vm.users[vm.adminRole].length === 0) {
        getUsers(vm.adminRole);
      }
      if (vm.users[vm.managerRole].length === 0) {
        getUsers(vm.managerRole);
      }
      getUserList();
    }

    function getUsers(role) {
      var filter = {
        role: role,
        project: $stateParams.uuid
      };
      projectPermissionsService.getList(filter).then(function(response) {
        vm.users[role] = response;
      });
    }

    function userSearchInputChanged(searchText) {
      getUserList({full_name: searchText});
    }

    function selectedUsersCallback(selected) {
      if (selected) {
        vm.user = selected.originalObject;
        addUser(this.id);
        getUserList();
      }
    }

    function addUser(role) {
      var instance = projectPermissionsService.$create();
      instance.user = vm.user.url;
      instance.project = vm.project.url;
      instance.role = role;
      instance.$save(
        function() {
          getUsers(role);
        },
        function(response) {
          alert(response.data.non_field_errors);
        }
      );
    }

    function userProjectRemove(userProject) {
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

    function update() {
      vm.project.$update();
    }

  }

})();

(function(){

  angular.module('ncsaas')
    .controller('ProjectResourcesTabController', [
      '$stateParams',
      'baseResourceListController',
      'resourcesService',
      ProjectResourcesTabController
    ]);

  function ProjectResourcesTabController($stateParams, baseResourceListController, resourcesService) {
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
