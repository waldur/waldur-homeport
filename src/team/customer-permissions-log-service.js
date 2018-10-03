// @ngInject
export default function customerPermissionsLogService(baseServiceClass) {
  let ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/customer-permissions-log/';
    },
  });
  return new ServiceClass();
}
