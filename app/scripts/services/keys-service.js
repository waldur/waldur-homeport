'use strict';

(function() {
  angular.module('ncsaas')
    .service('keysService', ['$q', 'RawKey', 'usersService', keysService]);

  function keysService($q, RawKey, usersService) {
    /*jshint validthis: true */
    var vm = this;
    vm.getKeyList = getKeyList;
    vm.getCurrentUserKeyList = getCurrentUserKeyList;

    function getKeyList() {
      return RawKey.query().$promise;
    }

    function getCurrentUserKeyList() {
      var deferred = $q.defer();
      usersService.getCurrentUser().then(initKeys, reject);

      function initKeys(user) {
        /*jshint camelcase: false */
        RawKey.query({user_uuid: user.uuid}).$promise.then(
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
    }

  }

})();

(function() {
  angular.module('ncsaas')
    .factory('RawKey', ['ENV', '$resource', RawKey]);

    function RawKey(ENV, $resource) {
      return $resource(ENV.apiEndpoint + 'api/keys/:keyUUID/', {keyUUID:'@uuid'});
    }

})();
