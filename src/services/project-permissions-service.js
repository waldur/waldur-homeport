// @ngInject
export default function projectPermissionsService(baseServiceClass, ncUtils) {
  let ServiceClass = baseServiceClass.extend({
    init:function() {
      this._super();
      this.endpoint = '/project-permissions/';
    },

    deletePermission: function(permission) {
      return this.$delete(this.getPermissionKey(permission));
    },

    getPermissionKey: ncUtils.getUUID
  });
  return new ServiceClass();
}
