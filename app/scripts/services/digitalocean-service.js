'use strict';

(function() {
  angular.module('ncsaas')
    .service('digitalOceanService', ['baseServiceClass', digitalOceanService]);

  function digitalOceanService(baseServiceClass) {
    /*jshint validthis: true */
    var ServiceClass = baseServiceClass.extend({
      init: function() {
        this._super();
        this.endpoint = '/digitalocean/';
      }
    });
    return new ServiceClass();
  }

})();
