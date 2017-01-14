// @ngInject
export default function openstackBackupsService(baseServiceClass) {
  var ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/openstacktenant-backups/';
      this.filterByCustomer = false;
    }
  });
  return new ServiceClass();
}
