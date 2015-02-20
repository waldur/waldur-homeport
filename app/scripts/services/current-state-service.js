'use strict';

(function() {
  angular.module('ncsaas')
    .service('currentStateService', ['RawUser', 'RawCustomer', '$q', currentStateService]);

  function currentStateService(RawUser, RawCustomer, $q) {
    /*jshint validthis: true */
    var vm = this;
    vm.getCustomer = getCustomer;
    vm.getUser = getUser;
    vm.setCustomer = setCustomer;

    // private variables:
    var user, customer;

    function getUser() {
      if (!user) {
        user = RawUser.getCurrent();
      }
      return user;
    }

    function getCustomer() {
      if (!customer) {
        customer = RawCustomer.getFirst();
        return customer.$promise;
      }

    }

    function setCustomer(newCustomer) {
      customer = newCustomer;
    }

  }

})();
