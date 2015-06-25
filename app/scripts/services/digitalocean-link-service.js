'use strict';

(function() {
  angular.module('ncsaas')
    .service('digitalOceanLinkService', ['baseServiceClass', 'ENV', '$resource', digitalOceanLinkService]);

  function digitalOceanLinkService(baseServiceClass, ENV, $resource) {
    var ServiceClass = baseServiceClass.extend({
      filterByCustomer: false,
      getFactory: function(isList, endpoint) {
        var endpoint = ENV.apiEndpoint + 'api/digitalocean/:uuid/link/';
        return $resource(endpoint, {uuid: '@uuid'}, {});
      }
    });
    return new ServiceClass();
  }
})();
