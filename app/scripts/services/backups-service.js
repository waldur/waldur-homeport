'use strict';

(function() {
  angular.module('ncsaas')
    .service('backupsService', ['baseServiceClass', backupsService]);

  function backupsService(baseServiceClass) {
    /*jshint validthis: true */
    var ServiceClass = baseServiceClass.extend({
      init:function() {
        this._super();
        this.endpoint = '/backups/';
        this.deleteBackup = this.operation.bind(this, 'delete');
        this.restoreBackup = this.operation.bind(this, 'restore');
      }
    });
    return new ServiceClass();
  }

})();
