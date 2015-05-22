'use strict';

(function() {
  angular.module('ncsaas')
    .service('templatesService', ['baseServiceClass', templatesService]);

  function templatesService(baseServiceClass) {
    /*jshint validthis: true */
    var ServiceClass = baseServiceClass.extend({
      init:function() {
        this._super();
        this.endpoint = '/iaas-templates/';
      }
    });
    return new ServiceClass();
  }

})();
