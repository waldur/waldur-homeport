'use strict';

(function() {
  angular.module('ncsaas')
    .service('usersService', ['RawUser', 'RawKey', usersService]);

  function usersService(RawUser, RawKey) {
    /*jshint validthis: true */
    var vm = this;
    vm.getCurrentUser = getCurrentUser;
    vm.getCurrentUserWithKeys = getCurrentUserWithKeys;
    vm.getUser = getUser;
    vm.getRawUserList = getRawUserList;

    function getCurrentUser() {
      return RawUser.getCurrent().$promise;
    }

    function getCurrentUserWithKeys() {
      return RawUser.getCurrent(initKeys);

      function initKeys(user) {
        /*jshint camelcase: false */
        user.keys = RawKey.query({user_uuid: user.uuid});
      }
    }

    function getRawUserList(filters) {
      filters = filters || {};
      return RawUser.query(filters);
    }

    function getUser(uuid) {
      return RawUser.get({userUUID: uuid});
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
