'use strict';

(function() {
  angular.module('ncsaas')
    .service('keysService', ['RawKey', keysService]);

  function keysService(RawKey) {
    /*jshint validthis: true */
    var vm = this;
    vm.getKeyList = getKeyList;

    function getKeyList() {
      return RawKey.query().$promise;
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
