// @ngInject
export default function openstackBackupSchedulesService(baseServiceClass) {
  let ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/openstacktenant-backup-schedules/';
    }
  });
  return new ServiceClass();
}
