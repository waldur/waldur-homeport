'use strict';

(function() {
  angular.module('ncsaas')
    .service('alertsService', ['baseServiceClass', alertsService]);

  function alertsService(baseServiceClass) {
    var ServiceClass = baseServiceClass.extend({
      init: function() {
        this._super();
        this.endpoint = '/alerts/';
      }
    });
    return new ServiceClass();
  }

})();