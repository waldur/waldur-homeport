'use strict';

(function() {
  angular.module('ncsaas')
    .controller('UserListController', [
      '$rootScope',
      'usersService',
      UserListController
    ]);

  function UserListController($location, usersService) {
    var vm = this;
    vm.pageSizes = [1,5,10,15,20];
    vm.currentPageSize = usersService.pageSize;
    vm.pages = usersService.pages ? usersService.pages : 5;
    vm.currentPage = usersService.page;
    vm.getNumber = getNumber;
    vm.changePage = changePage;
    vm.changePageSize = changePageSize;

    vm.list = {};
    vm.remove = remove;

    getUserList();

    function remove(user) {
      var index = vm.list.indexOf(user);

      user.$delete(function() {
        vm.list.splice(index, 1);
      });
    }

    function changePage(page) {
      vm.currentPage = page;
      usersService.page = page;
      getUserList();
    }

    function getUserList() {
      usersService.getRawUserList().then(function (response) {
        vm.pages = usersService.pages;
        vm.list = response;
      });
    }

    function getNumber(num) {
      return new Array(num);
    }

    function changePageSize(pageSize) {
      vm.currentPageSize = pageSize;
      vm.currentPage = 1;
      usersService.page = 1;
      usersService.pageSize = pageSize;
      getUserList();
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

    vm.activeTab = 'resources';
    vm.user = usersService.getUser($stateParams.uuid);
    vm.update = update;

    function update() {
      vm.user.$update();
    }

  }

})();
