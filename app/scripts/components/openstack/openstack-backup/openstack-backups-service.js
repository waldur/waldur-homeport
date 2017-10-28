// @ngInject
export default function openstackBackupsService(baseServiceClass) {
  let ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/openstacktenant-backups/';
    }
  });
  return new ServiceClass();
}
