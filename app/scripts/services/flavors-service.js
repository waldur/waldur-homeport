'use strict';

(function() {
  angular.module('ncsaas')
    .service('flavorsService', ['baseServiceClass', flavorsService]);

  function flavorsService(baseServiceClass) {
    /*jshint validthis: true */
    var ServiceClass = baseServiceClass.extend({
      init:function() {
        this._super();
        this.endpoint = '/flavors/';
      }
    });
    return new ServiceClass();
  }

})();
