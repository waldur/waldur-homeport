'use strict';
// This file contains controllers of base pages attributes: header, footer, body, common menu and so on

(function() {
  angular.module('ncsaas')
    .controller('HeaderContoller', ['currentStateService', 'customersService', HeaderContoller]);

  function HeaderContoller(currentStateService, customersService) {
    var vm = this;

    vm.customers = customersService.getCustomersList();
    vm.getUser = currentStateService.getUser;
    vm.getCustomer = currentStateService.getCustomer;
    vm.menuToggle = menuToggle;
    vm.setCurrentCustomer = setCurrentCustomer;
    // top-level menu
    vm.menuState = {
      addSomethingMenu : false,
      combineMenu : false,
      customerMenu : false,
      profileMenu : false
    };

    function menuToggle(active) {
      for (var property in vm.menuState) {
        if (vm.menuState.hasOwnProperty(property)) {
          if (property !== active) {
            vm.menuState[property] = false;
          }
        }
      }
      vm.menuState[active] = !vm.menuState[active];
    }

    function setCurrentCustomer(customer) {
      currentStateService.setCustomer(customer);
      vm.menuState.customerMenu = false;
    }

  }

})();
