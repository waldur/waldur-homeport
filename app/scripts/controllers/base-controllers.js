'use strict';
// This file contains controllers of base pages attributes: header, footer, body, common menu and so on

(function() {
  angular.module('ncsaas')
    .controller('HeaderContoller', ['currentStateService', 'customersService', HeaderContoller]);

  function HeaderContoller(currentStateService, customersService) {
    var vm = this;

    vm.customers = customersService.getCustomersList();
    // vm.initCustomersList = initCustomersList;
    vm.user = currentStateService.getUser();
    vm.customer = currentStateService.getCustomer();
    vm.setCurrentCustomer = currentStateService.setCustomer;
    vm.menuToggle = menuToggle;

    // setCustomer
    // fix this
    vm.setCurrentCustomerByClick = function(customer) {
      vm.setCurrentCustomer(customer);
      vm.customer = currentStateService.getCustomer();
    }

    // top-level menu
    vm.menuState = {
      addSomethingMenu : false,
      combineMenu : false,
      customerMenu : false,
      profileMenu : false
    }

    function menuToggle(active) {
      for (var property in vm.menuState) {
        if (vm.menuState.hasOwnProperty(property)) {
          if (property != active) {
            vm.menuState[property] = false;
          }
        }
      }
      vm.menuState[active] = !vm.menuState[active];
    }

  }

})();
