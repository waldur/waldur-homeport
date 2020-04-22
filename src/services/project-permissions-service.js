import { getUUID } from '@waldur/core/utils';

// @ngInject
export default function projectPermissionsService(baseServiceClass) {
  const ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/project-permissions/';
    },

    deletePermission: function(permission) {
      return this.$delete(this.getPermissionKey(permission));
    },

    getPermissionKey: getUUID,
  });
  return new ServiceClass();
}
