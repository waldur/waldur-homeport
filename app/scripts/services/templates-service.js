'use strict';

(function() {
  angular.module('ncsaas')
    .factory('RawTemplate', ['ENV', '$resource', RawTemplate]);

    function RawTemplate(ENV, $resource) {
      return $resource(ENV.apiEndpoint + 'api/templates/:templateUUID/', {templateUUID:'@uuid'});
    }

})();
