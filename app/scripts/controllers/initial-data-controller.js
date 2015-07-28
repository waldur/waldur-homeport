'use strict';

(function() {
  angular.module('ncsaas')
    .controller('InitialDataController',
      ['usersService', 'planCustomersService', 'currentStateService', '$state',
        'baseControllerClass', InitialDataController]);

  function InitialDataController(
    usersService, planCustomersService, currentStateService, $state, baseControllerClass) {
    /*jshint camelcase: false */
    var controllerScope = this;
    var Controller = baseControllerClass.extend({
      user: null,
      errors: {},
      plan: {},

      init: function() {
        this._super();
        this.activate();
      },
      activate: function() {
        var vm = this;
        usersService.getCurrentUser().then(function(response) {
          vm.user = response;
          if (response.email) {
            $state.go('dashboard.eventlog');
          }
        });

        currentStateService.getCustomer().then(function(customer) {
          planCustomersService.getList({customer: customer.uuid}).then(function(planCustomers) {
            if (planCustomers.length !== 0) {
              vm.plan = planCustomers[0].plan;
            }
          });
        });
      },
      // XXX: This is quick fix, we need to get display names from backend, but currently quotas on backend do not
      // have display names
      getPrettyQuotaName: function(name) {
        var prettyNames = {
          'nc_user_count': 'users',
          'nc_resource_count': 'resources',
          'nc_project_count': 'projects'
        };
        return prettyNames[name];
      },
      save: function() {
        var vm = this;
        if (vm.user.email) {
          vm.user.$update(
            function() {
              usersService.currentUser = null;
              $state.go('dashboard.eventlog');
            },
            function(error) {
              vm.errors = error.data;
            }
          );
        } else {
          var errorText = 'This field is required';
          vm.errors.email = [errorText];
        }
      }

    });

    controllerScope.__proto__ = new Controller();
  }

})();

(function() {

  angular.module('ncsaas')
    .controller('InitialDataControllerDemo',
    ['usersService', 'servicesService', 'baseControllerClass', 'currentStateService',
      'planCustomersService', InitialDataControllerDemo]);

  function InitialDataControllerDemo(
    usersService, servicesService, baseControllerClass, currentStateService, planCustomersService) {
    var controllerScope = this;
    var Controller = baseControllerClass.extend({
      user: {},
      services: {},
      chosenService: null,
      chosenServices: [],

      init: function() {
        this._super();
        this.activate();
      },
      activate: function() {
        var vm = this;
        usersService.getCurrentUser().then(function(response) {
          vm.user = response;
        });
        servicesService.getServicesList().then(function(response) {
          vm.services = response;
        });
        currentStateService.getCustomer().then(function(customer) {
          planCustomersService.getList({customer: customer.uuid}).then(function(planCustomers) {
            if (planCustomers.length !== 0) {
              vm.plan = planCustomers[0].plan;
            }
          });
        });
      },
      addService: function() {
        if (this.chosenService && !(this.chosenServices.lastIndexOf(this.chosenService) + 1)) {
          this.chosenServices.push(this.chosenService);
        }
      },
      removeService: function(service) {
        var index = this.chosenServices.lastIndexOf(service);
        if (index + 1) {
          this.chosenServices.splice(index, 1);
        }
      }
    });

    controllerScope.__proto__ = new Controller();
  }

})();
