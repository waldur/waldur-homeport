'use strict';

(function() {
  angular.module('ncsaas')
    .service('digitalOceanResourcesService', ['baseServiceClass', digitalOceanResourcesService]);

  function digitalOceanResourcesService(baseServiceClass) {
    var ServiceClass = baseServiceClass.extend({
      init: function() {
        this._super();
        this.endpoint = '/digitalocean-droplets/';
      }
    });
    return new ServiceClass();
  }

})();
