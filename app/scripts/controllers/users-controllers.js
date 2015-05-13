'use strict';

(function() {
  angular.module('ncsaas')
    .controller('UserListController', [
      '$rootScope',
      'usersService',
      'projectPermissionsService',
      UserListController
    ]);

  function UserListController($location, usersService, projectPermissionsService, $rootScope) {
    var vm = this;

    vm.showgroup = false;
    vm.list = [];
    vm.userProjects = {};

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
          page, getProjectsForUser, 'projects', uuid);
      });
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
