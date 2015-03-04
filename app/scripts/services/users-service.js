'use strict';

(function() {
  angular.module('ncsaas')
    .service('usersService', ['RawUser', 'RawKey', '$q', usersService]);

  function usersService(RawUser, RawKey, $q) {
    /*jshint validthis: true */
    var vm = this;
    vm.getCurrentUser = getCurrentUser;
    vm.getCurrentUserWithKeys = getCurrentUserWithKeys;
    vm.getUser = getUser;
    vm.getRawUserList = getRawUserList;
    vm.pageSize = 10;
    vm.page = 1;
    vm.pages = null;

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

    function getRawUserList() {
      var deferred = $q.defer();
      RawUser.getList({page_size:vm.pageSize, page:vm.page},function(response, responseHeaders){
        var header = responseHeaders(),
          objQuantity = header['x-result-count']? header['x-result-count'] : null;
        if (objQuantity) {
          vm.pages = Math.ceil(objQuantity/vm.pageSize);
        }
        deferred.resolve(response);
      }, function(err) {
        deferred.reject(err);
      });
      return deferred.promise;
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
          getList: {
            method: 'GET',
            isArray:true,
            params: {page_size:'@page_size', page:'@page'}
          },
          getCurrent: {
              method: 'GET',
              transformResponse: function(data) {return angular.fromJson(data)[0];},
              params: {current:''}
          }
        }
      );
    }

})();
