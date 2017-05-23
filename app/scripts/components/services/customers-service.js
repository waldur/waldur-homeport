// @ngInject
export default function customersService(baseServiceClass, $state, $q, $http, ENV, currentStateService, usersService) {
  var ServiceClass = baseServiceClass.extend({
    filterByCustomer: false,
    countryChoices: [],

    init:function() {
      this._super();
      this.endpoint = '/customers/';
    },
    getBalanceHistory: function(uuid) {
      var query = {UUID: uuid, operation: 'balance_history'};
      return this.getList(query);
    },
    getCounters: function(query) {
      var query = angular.extend({operation: 'counters'}, query);
      return this.getFactory(false).get(query).$promise;
    },
    isOwnerOrStaff: function() {
      var vm = this;
      return $q.all([
        currentStateService.getCustomer(),
        usersService.getCurrentUser()
      ]).then(function(result) {
        return vm.checkCustomerUser.apply(vm, result);
      });
    },
    checkCustomerUser: function(customer, user) {
      if (user && user.is_staff) {
        return true;
      }
      return customer && this.isOwner(customer, user);
    },
    isOwner: function(customer, user) {
      for (var i = 0; i < customer.owners.length; i++) {
        if (user && user.uuid === customer.owners[i].uuid) {
          return true;
        }
      }
      return false;
    },
    loadCountries: function() {
      var vm = this;
      if (vm.countryChoices.length != 0) {
        return $q.when(vm.countryChoices);
      } else {
        return $http({
          method: 'OPTIONS',
          url: ENV.apiEndpoint + 'api/customers/'
        }).then(function(response) {
          vm.countryChoices = response.data.actions.POST.country.choices;
          return vm.countryChoices;
        });
      }
    },
    countCustomers: function() {
      return $http.head(ENV.apiEndpoint + 'api/customers/').success(function(data, status, header) {
        return parseInt(header()['x-result-count']);
      });
    }
  });
  return new ServiceClass();
}
