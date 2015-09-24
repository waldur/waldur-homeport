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
        return this.getUrlByType(service_type).then(function(url) {
          return get(uuid, url);
        });
      },

      getOptions: function(service_type) {
        return this.getUrlByType(service_type).then(function(url) {
          return servicesService.getOption(url).then(function(response) {
            return response.actions.POST;
          });
        });
      },

      getUrlByType: function(service_type) {
        return servicesService.getServicesList().then(function(services) {
          return services[service_type].url;
        });
      }
    });
    return new ServiceClass();
  }
})();
