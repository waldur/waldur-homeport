'use strict';

(function() {
  angular.module('ncsaas')
    .controller('MenuController', ['$rootScope', MenuController]);

  function MenuController($rootScope) {
    var vm = this;

    vm.addSomethingMenu = false;
    vm.combineMenu = false;
    vm.customerMenu = false;
    vm.profileMenu = false;
    vm.collapse = false;

  }

})();
