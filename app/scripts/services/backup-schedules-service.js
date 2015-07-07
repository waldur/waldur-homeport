'use strict';

(function() {
  angular.module('ncsaas')
    .service('backupSchedulesService', ['baseServiceClass', backupSchedulesService]);

  function backupSchedulesService(baseServiceClass) {
    /*jshint validthis: true */
    var ServiceClass = baseServiceClass.extend({
      init:function() {
        this._super();
        this.endpoint = '/backup-schedules/';
      }
    });
    return new ServiceClass();
  }
})();
