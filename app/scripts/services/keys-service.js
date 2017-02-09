'use strict';

(function() {
  angular.module('ncsaas')
    .service('keysService', ['$q', 'usersService', 'baseServiceClass', keysService]);

  function keysService($q, usersService, baseServiceClass) {
    /*jshint validthis: true */
    var ServiceClass = baseServiceClass.extend({
      init:function() {
        this._super();
        this.endpoint = '/keys/';
      },
      getCurrentUserKeyList: function() {
        var deferred = $q.defer(),
          vm = this;
        usersService.getCurrentUser().then(initKeys, reject);

        function initKeys(user) {
          /*jshint camelcase: false */
          vm.getUserKeys(user.uuid).then(
            function(keys) {
              deferred.resolve(keys);
            },
            reject
          );
        }

        function reject(error) {
          deferred.reject(error);
        }

        return deferred.promise;
      },
      getUserKeys: function(userUuid) {
        return this.getList({user_uuid: userUuid});
      }
    });
    return new ServiceClass();
  }

})();
