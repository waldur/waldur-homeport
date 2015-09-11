'use strict';

(function () {
  angular.module('ncsaas')
    .service('joinService', ['baseServiceClass', 'servicesService', joinService]);

  function joinService(baseServiceClass, servicesService) {
    var ServiceClass = baseServiceClass.extend({
      init:function() {
        this._super();
        this.endpoint = '/services/';
        this.filterByCustomer = false;
      },

      $get: function(service_type, uuid) {
        var get = this._super.bind(this);
        return servicesService.getServicesList().then(function(services) {
          return get(uuid, services[service_type].url);
        });
      }
    });
    return new ServiceClass();
  }
})();
