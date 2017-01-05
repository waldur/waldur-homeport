// @ngInject
export default function openstackNetworksService(baseServiceClass) {
  var ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/openstack-networks/';
      this.filterByCustomer = false;
    }
  });
  return new ServiceClass();
}
