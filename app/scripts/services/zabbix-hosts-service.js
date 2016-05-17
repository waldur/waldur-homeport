'use strict';

(function() {
  angular.module('ncsaas')
    .service('zabbixHostsService', ['baseServiceClass', zabbixHostsService]);

  function zabbixHostsService(baseServiceClass) {
    /*jshint validthis: true */
    var ServiceClass = baseServiceClass.extend({
      init:function() {
        this._super();
        this.endpoint = '/zabbix-hosts/';
      }
    });
    return new ServiceClass();
  }
})();
