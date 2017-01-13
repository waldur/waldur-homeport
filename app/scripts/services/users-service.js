'use strict';

(function() {
  angular.module('ncsaas')
    .service('usersService', ['baseServiceClass', '$q', '$state', 'ENV', usersService]);

  function usersService(baseServiceClass, $q, $state, ENV) {
    var ServiceClass = baseServiceClass.extend({
      currentUser: null,
      init: function() {
        this._super();
        this.endpoint = '/users/';
      },
      getCurrentUser: function() {
        var vm = this;
        var deferred = $q.defer();
        var missingField = false;
        if (!vm.currentUser) {
          vm.getList({current:''}).then(function(response) {
            var user = response.length > 0 ? response[0] : null;
            vm.currentUser = user;
            if ($state.current.name !== 'initialdata.view') {
              ENV.userMandatoryFields.forEach(function(item) {
                if (!vm.currentUser[item]) {
                  missingField = true;
                }
              });
            }
            if (missingField) {
              deferred.reject();
              $state.go('initialdata.view');
            } else {
              deferred.resolve(vm.currentUser);
            }
          }, function(error) {
            deferred.reject(error);
          });
        } else {
          deferred.resolve(vm.currentUser);
        }
        return deferred.promise;
      },

      getCounters: function(query) {
        return this.getFactory(false, '/user-counters/').get(query).$promise;
      }
    });
    return new ServiceClass();
  }

})();

