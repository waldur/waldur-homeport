'use strict';

(function() {
  angular.module('ncsaas')
    .controller('UserListController', [
      'usersService',
      'projectPermissionsService',
      '$scope',
      UserListController
    ]);

  function UserListController(usersService, projectPermissionsService, $scope) {
    var vm = this;

    vm.showgroup = false;
    vm.list = [];
    vm.userProjects = {};
    vm.showMore = showMore;

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

    function getProjectsForUser(username, page) {
      var filter = {
        username:username
      };
      vm.userProjects[username] = {data:null};
      page = page || 1;
      projectPermissionsService.page = page;
      projectPermissionsService.pageSize = 5;
      vm.userProjects[username].page = page;
      projectPermissionsService.filterByCustomer = false;
      projectPermissionsService.getList(filter).then(function(response) {
        vm.userProjects[username].data = response;
        vm.userProjects[username].pages = projectPermissionsService.pages;
        $scope.$broadcast('mini-pagination:getNumberList', vm.userProjects[username].pages,
          page, getProjectsForUser, 'projects', username);
      });
    }

    function showMore(user) {
      if (!vm.userProjects[user.username]) {
        getProjectsForUser(user.username);
      }
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
    .controller('UserEventTabController', [
      '$stateParams',
      'usersService',
      'baseEventListController',
      UserEventTabController
    ]);

  function UserEventTabController($stateParams, usersService, baseEventListController) {
    var controllerScope = this;
    var EventController = baseEventListController.extend({
      user: null,

      init: function() {
        this.controllerScope = controllerScope;
        this._super();
        this.getUser();
      },
      getList: function(filter) {
        if (this.user) {
          this.service.defaultFilter.search = this.user.full_name;
          this._super(filter);
        }
      },
      getUser: function() {
        var vm = this;
        usersService.$get($stateParams.uuid).then(function (response) {
          vm.user = response;
          vm.getList();
        });
      }
    });

    controllerScope.__proto__ = new EventController();
  }

})();

(function() {
  angular.module('ncsaas')
    .controller('UserProjectTabController', [
      '$stateParams',
      'usersService',
      'baseControllerListClass',
      'projectPermissionsService',
      UserProjectTabController
    ]);

  function UserProjectTabController($stateParams, usersService, baseControllerListClass, projectPermissionsService) {
    var controllerScope = this;
    var ProjectController = baseControllerListClass.extend({
      user: null,

      init: function() {
        this.controllerScope = controllerScope;
        this.service = projectPermissionsService;
        this._super();
        this.getUser();
      },
      getList: function(filter) {
        if (this.user) {
          this.service.defaultFilter.username = this.user.username;
          this._super(filter);
        }
      },
      getUser: function() {
        var vm = this;
        usersService.$get($stateParams.uuid).then(function (response) {
          vm.user = response;
          vm.getList();
        });
      }
    });

    controllerScope.__proto__ = new ProjectController();
  }
})();
