'use strict';

(function() {
  angular.module('ncsaas')
    .service('digitalOceanLinkService', ['baseServiceClass', 'ENV', '$resource', digitalOceanLinkService]);

  function digitalOceanLinkService(baseServiceClass, ENV, $resource) {
    var ServiceClass = baseServiceClass.extend({
      filterByCustomer: false,
      getFactory: function() {
        var endpoint = ENV.apiEndpoint + 'api/digitalocean/:uuid/link/';
        return $resource(endpoint, {uuid: '@uuid'}, {});
      },
      add: function(options) {
        var instance = this.$create();
        instance.uuid = options.service_uuid;
        instance.project = options.project_url;
        instance.backend_id = options.droplet_id;
        instance.$save();
      }
    });
    return new ServiceClass();
  }
})();
