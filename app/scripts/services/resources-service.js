'use strict';

(function() {
  angular.module('ncsaas')
    .service('resourcesService', ['baseServiceClass', resourcesService]);

  function resourcesService(baseServiceClass) {
    var ServiceClass = baseServiceClass.extend({
      init:function() {
        this.getEndpoint = this.getEndpointUrl;
        this._super();
      },
      getAvailableOperations:function(resource) {
        var state = resource.state.toLowerCase();
        if (state === 'online') {return ['stop', 'restart'];}
        if (state === 'offline') {return ['start', 'delete'];}
        return [];
      },
      getEndpointUrl:function(isList) {
        var endpoint = (isList) ? '/resources/' : '/instances/';
        return endpoint;
      }
    });
    return new ServiceClass();
  }
})();
