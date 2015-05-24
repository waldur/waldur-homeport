'use strict';

(function() {
  angular.module('ncsaas')
    .controller('UserListController', [
      'baseControllerListClass',
      'usersService',
      'projectPermissionsService',
      '$scope',
      UserListController
    ]);

  function UserListController(baseControllerListClass, usersService, projectPermissionsService, $scope) {
    var controllerScope = this;
    var UserController = baseControllerListClass.extend({
      userProjects: {},

      init:function() {
        this.service = usersService;
        this.controllerScope = controllerScope;
        this._super();
        this.searchFieldName = 'full_name';
      },
      showMore: function(user) {
        if (!this.userProjects[user.username]) {
          this.getProjectsForUser(user.username);
        }
      },
      getProjectsForUser: function(username, page) {
        var vm = this;
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
            page, vm.getProjectsForUser.bind(vm), 'projects', username);
        });
      }
    });

    controllerScope.__proto__ = new UserController();
  }

  angular.module('ncsaas')
    .controller('UserDetailUpdateController', [
      'usersService',
      'baseControllerDetailUpdateClass',
      UserDetailUpdateController
    ]);

  function UserDetailUpdateController(usersService, baseControllerDetailUpdateClass) {
    var controllerScope = this;
    var Controller = baseControllerDetailUpdateClass.extend({
      activeTab: 'eventlog',

      init:function() {
        this.service = usersService;
        this.controllerScope = controllerScope;
        this._super();
        this.detailsState = 'customers.details';
      }
    });

    controllerScope.__proto__ = new Controller();
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

(function() {
  angular.module('ncsaas')
    .controller('UserKeyTabController', [
      '$stateParams',
      'keysService',
      'baseControllerListClass',
      UserKeyTabController
    ]);

  function UserKeyTabController($stateParams, keysService, baseControllerListClass) {
    var controllerScope = this;
    var Controller = baseControllerListClass.extend({
      init: function() {
        this.controllerScope = controllerScope;
        this.service = keysService;
        this.service.defaultFilter.user_uuid = $stateParams.uuid;
        this._super();
      }
    });

    controllerScope.__proto__ = new Controller();
  }

})();
