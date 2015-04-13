'use strict';
// This file contains controllers of base pages attributes: header, footer, body, common menu and so on

(function() {
  angular.module('ncsaas')
    .controller('HeaderController', [
      '$rootScope', '$scope', '$state', 'currentStateService', 'customersService', 'usersService', HeaderController]);

  function HeaderController($rootScope, $scope, $state, currentStateService, customersService, usersService) {
    var vm = this;

    vm.customers = customersService.getCustomersList();
    vm.currentUser = {};
    vm.currentCustomer = {};
    vm.menuToggle = menuToggle;
    vm.mobileMenu = mobileMenu;
    vm.setCurrentCustomer = setCurrentCustomer;

    // initiate current user
    usersService.getCurrentUser().then(function(response) {
      vm.currentUser = response;
    });

    // initiate current customer
    currentStateService.getCustomer().then(function(customer) {
      vm.currentCustomer = customer;
    });

    function setCurrentCustomer(customer) {
      currentStateService.setCustomer(customer);
      vm.currentCustomer = customer;
      $rootScope.$broadcast('currentCustomerUpdated');
    }

    // top-level menu
    vm.menuState = {
      addSomethingMenu : false,
      customerMenu : false,
      profileMenu : false
    };
    // top-level menu active state
    vm.menuItemActive = currentStateService.getActiveItem($state.current.name);

    function menuToggle(active, event) {
      for (var property in vm.menuState) {
        if (vm.menuState.hasOwnProperty(property)) {
          if (property !== active) {
            vm.menuState[property] = false;
          }
        }
      }
      event.stopPropagation();
      vm.menuState[active] = !vm.menuState[active];
    }

    function mobileMenu() {
      vm.showMobileMenu = !vm.showMobileMenu;
      console.log(vm.showMobileMenu);
      console.log('sddd');
    }

    window.onclick = function() {
      for (var property in vm.menuState) {
        if (vm.menuState.hasOwnProperty(property)) {
          vm.menuState[property] = false;
        }
      }
      $scope.$apply();
    };

  }

  angular.module('ncsaas')
    .controller('MainController', [
      '$rootScope', '$state', 'authService', 'currentStateService', 'customersService', MainController]);

    function MainController($rootScope, $state, authService, currentStateService, customersService) {
      $rootScope.logout = logout;

      function logout() {
        authService.signout();
        $state.go('login');
      }

      $rootScope.$on('$stateChangeSuccess', function(event, toState) {
        $rootScope.bodyClass = currentStateService.getBodyClass(toState.name);
      });

      $rootScope.$on('$stateChangeSuccess', function(event, toState) {
        // if user is authenticated - he should have selected customer
        if (authService.isAuthenticated() && !currentStateService.isCustomerDefined) {
          var customer = customersService.getFirst();
          currentStateService.setCustomer(customer);
        }
      });
    }

})();
