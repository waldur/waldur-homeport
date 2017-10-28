// @ngInject
export default function openstackNetworksService(baseServiceClass) {
  let ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/openstack-networks/';
    }
  });
  return new ServiceClass();
}
