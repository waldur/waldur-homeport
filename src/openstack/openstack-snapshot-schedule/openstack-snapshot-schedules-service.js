// @ngInject
export default function openstackSnapshotSchedulesService(baseServiceClass) {
  let ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/openstacktenant-snapshot-schedules/';
    }
  });
  return new ServiceClass();
}
