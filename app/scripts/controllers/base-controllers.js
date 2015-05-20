'use strict';
// This file contains controllers of base pages attributes: header, footer, body, common menu and so on

(function() {
  angular.module('ncsaas')
    .controller('HeaderController', [
      '$rootScope', '$scope', '$state', 'currentStateService', 'customersService',
      'usersService', 'ENV', 'baseControllerClass', HeaderController]);

  function HeaderController(
    $rootScope, $scope, $state, currentStateService, customersService, usersService, ENV, baseControllerClass) {
    var controllerScope = this;
    var HeaderControllerClass = baseControllerClass.extend({
      customers: [],
      currentUser: {},
      currentCustomer: {},
      menuState: {
        addSomethingMenu: false,
        customerMenu: false,
        profileMenu: false
      },

      init: function() {
        this.activate();
        this.menuItemActive = currentStateService.getActiveItem($state.current.name);
      },
      activate: function() {
        var vm = this;
        // XXX: for top menu customers viewing
        customersService.pageSize = ENV.topMenuCustomersCount;
        customersService.getList().then(function(response) {
          vm.customers = response;
        });
        // reset pageSize
        customersService.pageSize = ENV.pageSize;

        // initiate current user
        usersService.getCurrentUser().then(function(response) {
          vm.currentUser = response;
        });

        // initiate current customer
        currentStateService.getCustomer().then(function(customer) {
          vm.currentCustomer = customer;
        });

        window.onclick = function() {
          for (var property in vm.menuState) {
            if (vm.menuState.hasOwnProperty(property)) {
              vm.menuState[property] = false;
            }
          }
          $scope.$apply();
        };
      },
      setCurrentCustomer: function(customer) {
        var vm = this;
        currentStateService.setCustomer(customer);
        vm.currentCustomer = customer;
        $rootScope.$broadcast('currentCustomerUpdated');
      },
      menuToggle: function(active, event) {
        var vm = this;
        for (var property in vm.menuState) {
          if (vm.menuState.hasOwnProperty(property)) {
            if (property !== active) {
              vm.menuState[property] = false;
            }
          }
        }
        event.stopPropagation();
        vm.menuState[active] = !vm.menuState[active];
      },
      mobileMenu: function() {
        this.showMobileMenu = !this.showMobileMenu;
      }
    });

    controllerScope.__proto__ = new HeaderControllerClass();
  }

  angular.module('ncsaas')
    .controller('MainController', [
      '$q', '$rootScope', '$state', 'authService', 'currentStateService', 'customersService', 'usersService',
      MainController]);

    function MainController($q, $rootScope, $state, authService, currentStateService, customersService, usersService) {
      $rootScope.logout = logout;

      function logout() {
        authService.signout();
        currentStateService.isCustomerDefined = false;
        $state.go('home.login');
      }

      $rootScope.$on('$stateChangeSuccess', function(event, toState) {
        $rootScope.bodyClass = currentStateService.getBodyClass(toState.name);
      });



      $rootScope.$on('$stateChangeSuccess', function(event, toState) {
        // if user is authenticated - he should have selected customer
        if (authService.isAuthenticated() && !currentStateService.isCustomerDefined) {
          var deferred = $q.defer();
          usersService.getCurrentUser().then(function(user) {
            customersService.getPersonalOrFirstCustomer(user.username).then(function(customer) {
              deferred.resolve(customer);
            });
          });
          currentStateService.setCustomer(deferred.promise);
        }
        /*jshint camelcase: false */
        if (toState.auth) {
          usersService.getCurrentUser().then(function(response) {
            if (!response.full_name || !response.email) {
              $state.go('initialdata.view');
            }
          });
        }
      });
    }

})();

