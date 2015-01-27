'use strict';

(function() {
  angular.module('ncsaas')
    .controller('MenuController', ['$rootScope', MenuController]);

  function MenuController($rootScope) {
    var vm = this;

    vm.menuToggle = menuToggle;

    vm.menuState = {
      addSomethingMenu : false,
      combineMenu : false,
      customerMenu : false,
      profileMenu : false
    }

    function menuToggle(active) {
      for (var property in vm.menuState) {
        if (vm.menuState.hasOwnProperty(property)) {
          if (vm.menuState[property] != active) {
            vm.menuState[property] = false;
          }
        }
      }
      vm.menuState[active] = !vm.menuState[active]
    }

  }

})();
