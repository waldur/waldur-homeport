'use strict';

(function() {
  angular.module('ncsaas')
    .service('zabbixItservicesService', ['baseServiceClass', zabbixItservicesService]);

  function zabbixItservicesService(baseServiceClass) {
    /*jshint validthis: true */
    var ServiceClass = baseServiceClass.extend({
      init:function() {
        this._super();
        this.endpoint = '/zabbix-itservices/';
      }
    });
    return new ServiceClass();
  }

})();
