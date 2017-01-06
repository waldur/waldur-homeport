// @ngInject
export default function openstackSnapshotsService(baseServiceClass) {
  var ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/openstacktenant-snapshots/';
      this.filterByCustomer = false;
    }
  });
  return new ServiceClass();
}
