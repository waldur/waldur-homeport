// @ngInject
export default function zabbixHostsService(baseServiceClass) {
  var ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/zabbix-hosts/';
    }
  });
  return new ServiceClass();
}
