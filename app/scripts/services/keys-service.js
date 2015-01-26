'use strict';

(function() {
  angular.module('ncsaas')
    .factory('RawKey', ['ENV', '$resource', RawKey]);

    function RawKey(ENV, $resource) {
      return $resource(ENV.apiEndpoint + 'api/keys/:keyUUID/', {keyUUID:'@uuid'});
    }

})();
