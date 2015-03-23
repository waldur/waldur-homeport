'use strict';

(function() {
  angular.module('ncsaas')
    .service('servicesService', ['baseServiceClass', servicesService]);

  function servicesService(baseServiceClass) {
    /*jshint validthis: true */
    var ServiceClass = baseServiceClass.extend({
      init:function() {
        this._super();
      },
      getEndpoint:function() {
        var endpoint = '/clouds/';
        return endpoint;
      }
    });
    return new ServiceClass();
  }

})();
