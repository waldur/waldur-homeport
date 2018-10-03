// @ngInject
export default function zabbixItservicesService(baseServiceClass) {
  let ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/zabbix-itservices/';
    }
  });
  return new ServiceClass();
}
