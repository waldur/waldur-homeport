// @ngInject
export default function openstackSubnetsService(baseServiceClass) {
  let ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/openstack-subnets/';
    }
  });
  return new ServiceClass();
}
