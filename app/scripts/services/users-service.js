'use strict';

(function() {
  angular.module('ncsaas')
    .service('usersService', ['RawUser', 'RawKey', usersService]);

  function usersService(RawUser, RawKey) {
    /*jshint validthis: true */
    var vm = this;
    vm.getCurrentUser = getCurrentUser;
    vm.getCurrentUserWithKeys = getCurrentUserWithKeys;

    function getCurrentUser() {
      return RawUser.getCurrent();
    }

    function getCurrentUserWithKeys() {
      return RawUser.getCurrent(initKeys);

      function initKeys(user) {
        /*jshint camelcase: false */
        user.keys = RawKey.query({user_uuid: user.uuid});
      }
    }

  }

})();

(function() {
  angular.module('ncsaas')
    .factory('RawUser', ['ENV', '$resource', RawUser]);

    function RawUser(ENV, $resource) {
      return $resource(ENV.apiEndpoint + 'api/users/:userUUID/', {userUUID:'@uuid'},
        {
          getCurrent: {
              method: 'GET',
              transformResponse: function(data) {return angular.fromJson(data)[0];},
              params: {current:''}
          }
        }
      );
    }

})();
