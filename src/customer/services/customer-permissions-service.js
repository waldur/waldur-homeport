// @ngInject
export default function customerPermissionsService(baseServiceClass, ncUtils) {
  const ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/customer-permissions/';
    },

    deletePermission: function(permission) {
      return this.$delete(this.getPermissionKey(permission));
    },

    getPermissionKey: ncUtils.getUUID,
  });
  return new ServiceClass();
}
