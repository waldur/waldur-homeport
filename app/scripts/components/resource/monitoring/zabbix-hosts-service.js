// @ngInject
export default function zabbixHostsService(baseServiceClass) {
  let ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/zabbix-hosts/';
    }
  });
  return new ServiceClass();
}
