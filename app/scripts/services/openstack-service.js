'use strict';

(function() {
  angular.module('ncsaas')
    .service('openstackService', ['baseServiceClass', openstackService]);

  function openstackService(baseServiceClass) {
    var ServiceClass = baseServiceClass.extend({
      init:function() {
        this._super();
        this.endpoint = '/iaas-resources/';
        this.stopResource = this.operation.bind(this, 'stop');
        this.startResource = this.operation.bind(this, 'start');
        this.restartResource = this.operation.bind(this, 'restart');
      },
      getAvailableOperations:function(resource) {
        var state = resource.state.toLowerCase();
        if (state === 'online') {return ['stop', 'restart'];}
        if (state === 'offline') {return ['start', 'delete'];}
        return [];
      }
    });
    return new ServiceClass();
  }
})();
