'use strict';

(function() {
  angular.module('ncsaas')
    .service('cloudsService', ['baseServiceClass', cloudsService]);

  function cloudsService(baseServiceClass) {
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
