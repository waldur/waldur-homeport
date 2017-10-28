// @ngInject
export default function projectPermissionsLogService(baseServiceClass) {
  let ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/project-permissions-log/';
    },
  });
  return new ServiceClass();
}
