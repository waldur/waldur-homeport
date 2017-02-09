// @ngInject
export default function openstackFloatingIpsService(baseServiceClass) {
  var ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/openstack-floating-ips/';
    }
  });
  return new ServiceClass();
}
