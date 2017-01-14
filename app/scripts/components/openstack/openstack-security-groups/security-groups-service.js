// @ngInject
export default function openstackSecurityGroupsService(baseServiceClass) {
  var ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/openstack-security-groups/';
      this.filterByCustomer = false;
    }
  });
  return new ServiceClass();
}
