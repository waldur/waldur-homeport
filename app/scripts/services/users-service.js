'use strict';

(function() {
  angular.module('ncsaas')
    .service('usersService', ['baseServiceClass', '$q', usersService]);

  function usersService(baseServiceClass, $q) {
    var ServiceClass = baseServiceClass.extend({
      currentUser: null,
      init:function() {
        this._super();
        this.endpoint = '/users/';
      },
      getCurrentUser:function() {
        var vm = this;
        var deferred = $q.defer();
        vm.filterByCustomer = false;
        vm.getList({current:''}).then(function(response) {
          var user = response.length > 0 ? response[0] : null;
          deferred.resolve(response[0]);
        }, function(error) {
          deferred.reject(error);
        });
        vm.filterByCustomer = true;
        return deferred.promise;
      }
    });
    return new ServiceClass();
  }

})();

