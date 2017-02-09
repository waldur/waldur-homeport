'use strict';

(function() {
  angular.module('ncsaas')
    .service('projectPermissionsService', ['baseServiceClass', 'ncUtils', projectPermissionsService]);

  function projectPermissionsService(baseServiceClass, ncUtils) {
    var ServiceClass = baseServiceClass.extend({
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

})();

(function() {
  angular.module('ncsaas').constant('USERPROJECTROLE', {
    admin: 'admin',
    manager: 'manager'
  });
})();
