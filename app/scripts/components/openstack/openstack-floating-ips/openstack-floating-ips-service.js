// @ngInject
export default function openstackFloatingIpsService(baseServiceClass) {
  let ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/openstack-floating-ips/';
    }
  });
  return new ServiceClass();
}
