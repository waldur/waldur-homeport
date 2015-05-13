'use strict';

(function() {
  angular.module('ncsaas')
    .controller('InitialDataController',
      ['usersService', 'planCustomersService', 'currentStateService', '$state', InitialDataController]);

  function InitialDataController(usersService, planCustomersService, currentStateService, $state) {
    /*jshint camelcase: false */
    var vm = this;

    vm.user = null;
    vm.errors = {};
    vm.save = save;
    vm.getPrettyQuotaName = getPrettyQuotaName;

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

    // XXX: This is quick fix, we need to get display names from backend, but currently quotas on backend do not
    // have display names
    function getPrettyQuotaName(name) {
      var prettyNames = {
        'nc_user_count': 'users',
        'nc_resource_count': 'resources',
        'nc_project_count': 'projects'
      };
      return prettyNames[name];
    }

    function save() {
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
  }
})();
