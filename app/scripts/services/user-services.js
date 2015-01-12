'use strict';

(function() {
  angular.module('ncsaas')
    .service('usersService', ['ENV', '$resource', usersService]);

  function usersService(ENV, $resource, $cookies) {
    /*jshint validthis: true */
    var vm = this;
    vm.userResource = $resource(ENV.apiEndpoint + 'api/users/:userUUID', {userUUID:'@uuid'});

  }

})();
