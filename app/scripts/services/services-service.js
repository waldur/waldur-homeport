'use strict';

(function() {
  angular.module('ncsaas')
    .service('servicesService', ['baseServiceClass', servicesService]);

  function servicesService(baseServiceClass) {
    /*jshint validthis: true */
    var ServiceClass = baseServiceClass.extend({
      init:function() {
        this._super();
        this.endpoint = '/clouds/';
      }
    });
    return new ServiceClass();
  }

})();
