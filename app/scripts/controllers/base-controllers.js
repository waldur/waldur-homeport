'use strict';
// This file contains controllers of base pages attributes: header, footer, body, common menu and so on

(function() {
  angular.module('ncsaas')
    .controller('HeaderController', ['$scope', '$state', 'currentStateService', 'customersService', HeaderController]);

  function HeaderController($scope, $state, currentStateService, customersService) {
    var vm = this;

    vm.customers = customersService.getCustomersList();
    vm.currentUser = {};
    vm.currentCustomer = {};
    vm.menuToggle = menuToggle;
    vm.setCurrentCustomer = setCurrentCustomer;

    // initiate current customer
    currentStateService.getCustomer().then(function(response) {
      vm.currentCustomer = response;
    });

    // initiate current user
    currentStateService.getUser().then(function(response) {
      vm.currentUser = response;
    });

    function setCurrentCustomer(customer) {
      currentStateService.setCustomer(customer);
      vm.currentCustomer = customer;
    }

    // top-level menu
    vm.menuState = {
      addSomethingMenu : false,
      combineMenu : false,
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
    .controller('MainController', ['$rootScope', '$state', 'authService', 'currentStateService', MainController]);

    function MainController($rootScope, $state, authService, currentStateService) {
      var vm = this;
      $rootScope.logout = logout;

      function logout() {
        authService.signout();
        $state.go('login');
      }

      $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        $rootScope.bodyClass = currentStateService.getBodyClass(toState.name);

        if (toState.name === 'home' || toState.name === 'login') {
          if (authService.isAuthenticated()) {
            $state.go('dashboard');
          }
        }
        if (toState.auth && !authService.isAuthenticated()) {
          $state.go('login');
        }
      });
    }

})();
