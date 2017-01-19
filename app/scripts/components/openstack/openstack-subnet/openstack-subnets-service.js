// @ngInject
export default function openstackSubnetsService(baseServiceClass) {
  var ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/openstack-subnets/';
    }
  });
  return new ServiceClass();
}
