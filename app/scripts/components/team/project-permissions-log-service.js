// @ngInject
export default function projectPermissionsLogService(baseServiceClass) {
  var ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/project-permissions-log/';
    },
  });
  return new ServiceClass();
}
