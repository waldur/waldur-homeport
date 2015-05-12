'use strict';

(function() {
  angular.module('ncsaas')
    .controller('UserListController', [
      '$rootScope',
      'usersService',
      UserListController
    ]);

  function UserListController($location, usersService, $rootScope) {
    var vm = this;

    vm.showgroup = false;
    vm.list = [];

    vm.search = search;
    vm.searchInput = null;

    getUsers();

    function getUsers(filter) {
      filter = filter || null;
      usersService.getList(filter).then(function(response) {
        vm.list = response;
      });
    }

    usersService.getList().then(function(response) {
      vm.list = response;
    });
    vm.remove = remove;
    vm.service = usersService;

    function remove(user) {
      var index = vm.list.indexOf(user);

      user.$delete(function() {
        vm.list.splice(index, 1);
      });
    }

    function search() {
      var filter = {full_name: vm.searchInput}
      getUsers(filter);
    }

  }

  angular.module('ncsaas')
    .controller('UserDetailUpdateController', [
      '$stateParams',
      '$rootScope',
      'usersService',
      UserDetailUpdateController
    ]);

  function UserDetailUpdateController($stateParams, $rootScope, usersService) {
    var vm = this;

    vm.activeTab = 'eventlog';
    vm.user = null;
    
    usersService.$get($stateParams.uuid).then(function(response) {
      vm.user = response;
    });
    vm.update = update;

    function update() {
      vm.user.$update();
    }

  }

})();

(function() {
  angular.module('ncsaas')
    .controller('AddToProjectUserController', [
      'baseControllerAddClass',
      'usersService',
      'projectsService',
      '$stateParams',
      'projectPermissionsService',
      'USERPROJECTROLE',
      AddToProjectUserController
    ]);

  function AddToProjectUserController(
    baseControllerAddClass, usersService, projectsService, $stateParams, projectPermissionsService, USERPROJECTROLE) {
    var controllerScope = this;
    var AddToProject = baseControllerAddClass.extend({
      projects: [],
      user: null,

      init: function() {
        this.service = projectPermissionsService;
        this.controllerScope = controllerScope;
        this.setSignalHandler('currentCustomerUpdated', this.getProjects.bind(this));
        this._super();
        this.listState = 'users.list';
        this.instance.role = USERPROJECTROLE.admin;
      },
      activate: function() {
        this.getProjects();
        this.getUser();
      },
      getProjects: function() {
        var vm = this;
        projectsService.getList().then(function(response) {
          vm.projects = response;
        });
      },
      getUser: function() {
        var vm = this;
        usersService.$get($stateParams.uuid).then(function(response) {
          vm.user = response;
          vm.instance.user = response.url;
        });
      }
    });

    controllerScope.__proto__ = new AddToProject();
  }

})();

(function() {
  angular.module('ncsaas')
    .controller('RemoveFromProjectUserController', [
      'usersService',
      '$stateParams',
      'projectPermissionsService',
      '$state',
      'baseControllerClass',
      RemoveFromProjectUserController
    ]);

  function RemoveFromProjectUserController(
    usersService, $stateParams, projectPermissionsService, $state, baseControllerClass) {
    var controllerScope = this;

    var Controller = baseControllerClass.extend({
      user: null,
      projects: [],
      errors: {},

      init: function() {
        this.setSignalHandler('currentCustomerUpdated', this.getProjects.bind(controllerScope));
        this._super();
        this.activate();
      },
      activate: function() {
        var vm = this;
        usersService.$get($stateParams.uuid).then(function(response) {
          vm.user = response;
          vm.getProjects();
        });
      },
      getProjects: function() {
        var vm = this;
        projectPermissionsService.getList({username: vm.user.username}).then(function(response) {
          vm.projects = response;
        });
      },
      remove: function() {
        var vm = this;
        if (vm.project) {
          projectPermissionsService.$delete(vm.project.pk).then(
            vm.cancel,
            function(response) {
              alert(response.data.detail);
            }
          );
        } else {
          vm.errors.project = ['This field is required.'];
        }
      },
      cancel: function() {
        $state.go('users.list');
      }
    });

    controllerScope.__proto__ = new Controller();
  }

})();
