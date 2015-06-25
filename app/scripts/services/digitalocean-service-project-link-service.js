'use strict';

(function() {
  angular.module('ncsaas')
    .service('digitalOceanServiceProjectLinkService', ['baseServiceClass', digitalOceanServiceProjectLinkService]);

  function digitalOceanServiceProjectLinkService(baseServiceClass) {
    /*jshint validthis: true */
    var ServiceClass = baseServiceClass.extend({
      filterByCustomer: false,
      init: function() {
        this._super();
        this.endpoint = '/digitalocean-service-project-link/';
      }
    });
    return new ServiceClass();
  }

})();
