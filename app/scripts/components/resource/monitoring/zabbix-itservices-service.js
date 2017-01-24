// @ngInject
export default function zabbixItservicesService(baseServiceClass) {
  var ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/zabbix-itservices/';
    }
  });
  return new ServiceClass();
}
