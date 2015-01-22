'use strict';

(function() {
  angular.module('ncsaas')
    .service('usersService', ['ENV', '$resource', usersService]);

  function usersService(ENV, $resource, $cookies) {
    /*jshint validthis: true */
    var vm = this;
    // TODO: rewrite this to getUser, getUsers and other methods or delete service it is not needed
    vm.userResource = $resource(ENV.apiEndpoint + 'api/users/:userUUID/', {userUUID:'@uuid'});

  }

})();

(function() {
  angular.module('ncsaas')
    .factory('RawUser', ['ENV', '$resource', RawUser]);

    function RawUser(ENV, $resource) {
      return $resource(ENV.apiEndpoint + 'api/users/:userUUID/', {userUUID:'@uuid'});
    }

})();
