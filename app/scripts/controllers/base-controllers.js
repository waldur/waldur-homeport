'use strict';
// This file contains controllers of base pages attributes: header, footer, body, common menu and so on

(function() {
  angular.module('ncsaas')
    .controller('HeaderContoller', ['$document', 'currentStateService', 'customersService', HeaderContoller]);

  function HeaderContoller($document, currentStateService, customersService) {
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

      event.stopPropagation();
      vm.menuState[active] = !vm.menuState[active];

      console.log('before');
      console.log(vm.menuState);

      $document.bind('click', function() {
        console.log('after');
        vm.menuState[active] = false;
        console.log(vm.menuState);
        console.log('Done');
      });
    }

    function setCurrentCustomer(customer) {
      currentStateService.setCustomer(customer);
      vm.menuState.customerMenu = false;
    }

  }

// angular.module('ncsaas')
// .directive('clickAnywhereButHere', function($document){
//   return {
//     restrict: 'A',
//     link: function(scope, elem, attr, ctrl) {
//       elem.bind('click', function(e) {
//         // this part keeps it from firing the click on the document.
//         e.stopPropagation();
//       });
//       $document.bind('click', function() {
//         // magic here.
//         scope.$apply(attr.clickAnywhereButHere);
//       })
//     }
//   }
// })

})();
