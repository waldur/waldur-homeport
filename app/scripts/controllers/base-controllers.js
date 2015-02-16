'use strict';
// This file contains controllers of base pages attributes: header, footer, body, common menu and so on

(function() {
  angular.module('ncsaas')
    .controller('HeaderController', ['$scope', 'currentStateService', 'customersService', HeaderController]);

  function HeaderController($scope, currentStateService, customersService) {
    var vm = this;

    vm.customers = customersService.getCustomersList();
    vm.getUser = currentStateService.getUser;
    vm.getCustomer = currentStateService.getCustomer;
    vm.menuToggle = menuToggle;
    vm.setCurrentCustomer = currentStateService.setCustomer;
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
    .controller('BodyController', ['$rootScope', '$state', BodyController]);

    function BodyController($rootScope, $state) {
      var vm = this;

      $rootScope.bodyClass = 'app-body';

      vm.stateWithProfile = [
        'profile',
        'profile-edit',
        'project',
        'project-edit',
        'customer',
        'customer-edit',
        'customer-plans',
        'user'
      ]

      vm.stateSite = [
        'home',
        'login'
      ]

      Array.prototype.inList = function(name) {
        for (var i = 0; i < this.length; i++) {
          if (this[i] == name) return true;
        }
        return false;
      }

      $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        if (vm.stateWithProfile.inList(toState.name) || vm.stateSite.inList(toState.name)) {
          if (vm.stateWithProfile.inList(toState.name)) {
            $rootScope.bodyClass = 'app-body obj-view';
          } else if (vm.stateSite.inList(toState.name)) {
            $rootScope.bodyClass = 'app-body site-body';
          }
        } else {
          $rootScope.bodyClass = 'app-body';
        }
      });
    }

})();
