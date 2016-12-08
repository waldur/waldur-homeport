'use strict';

(function() {
  angular.module('ncsaas')
    .service('openstackTenantVolumesService', ['baseServiceClass', openstackTenantVolumesService]);

  function openstackTenantVolumesService(baseServiceClass) {
    /*jshint validthis: true */
    var ServiceClass = baseServiceClass.extend({
      init:function() {
        this._super();
        this.endpoint = '/openstacktenant-volumes/';
      }
    });
    return new ServiceClass();
  }

})();
