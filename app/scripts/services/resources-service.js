'use strict';

(function() {
  angular.module('ncsaas')
    .service('resourcesService', [
      'baseServiceClass', 'ENV', '$http', 'servicesService', resourcesService]);

  function resourcesService(baseServiceClass, ENV, $http, servicesService) {
    var ServiceClass = baseServiceClass.extend({
      init:function() {
        this._super();
        this.endpoint = '/resources/';
      },

      $get: function(resource_type, uuid) {
        var get = this._super.bind(this);
        return this.getUrlByType(resource_type).then(function(url) {
          return get(uuid, url);
        });
      },

      getUrlByType: function(resource_type) {
        var parts = resource_type.split(".");
        var service_type = parts[0];
        var type = parts[1];
        return servicesService.getServicesList().then(function(services) {
          return services[service_type].resources[type];
        });
      },

      countByType: function(params) {
        var url = ENV.apiEndpoint + 'api' + '/resources/count/';
        return $http.get(url, {params: params}).then(function(response) {
          return response.data;
        });
      },

      getAvailableOperations: function(resource) {
        var state = resource.state.toLowerCase();
        if (state === 'online') {return ['stop', 'restart'];}
        if (state === 'offline') {return ['start', 'delete'];}
        return [];
      }
    });
    return new ServiceClass();
  }
})();
