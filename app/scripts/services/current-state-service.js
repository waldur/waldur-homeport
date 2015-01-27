'use strict';

(function() {
  angular.module('ncsaas')
    .service('currentStateService', ['RawUser', 'RawCustomer', currentStateService]);

  function currentStateService(RawUser, RawCustomer) {
    /*jshint validthis: true */
    var vm = this;
    vm.getCustomer = getCustomer;
    vm.getUser = getUser;

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
      }
      return customer;
    }

    function setCustomer(newCustomer) {
      customer = newCustomer;
    }

  }

})();
