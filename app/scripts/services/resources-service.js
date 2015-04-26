'use strict';

(function() {
  angular.module('ncsaas')
    .service('resourcesService', ['baseServiceClass', resourcesService]);

  function resourcesService(baseServiceClass) {
    var ServiceClass = baseServiceClass.extend({
      init:function() {
        this._super();
        this.stopResource = this.operation.bind(this, 'stop');
        this.startResource = this.operation.bind(this, 'start');
        this.restartResource = this.operation.bind(this, 'restart');
      },
      getAvailableOperations:function(resource) {
        var state = resource.state.toLowerCase();
        if (state === 'online') {return ['stop', 'restart'];}
        if (state === 'offline') {return ['start', 'delete'];}
        return [];
      },
      getEndpoint:function(isList) {
        return '/instances/';
      }
    });
    return new ServiceClass();
  }
})();
