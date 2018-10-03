// @ngInject
export default function openstackTenantsService(baseServiceClass) {
  let ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/openstack-tenants/';
    }
  });
  return new ServiceClass();
}
