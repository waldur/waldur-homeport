'use strict';

(function() {
  angular.module('ncsaas')
    .service('projectPermissionsService', ['baseServiceClass', projectPermissionsService]);

  function projectPermissionsService(baseServiceClass) {
    /*jshint validthis: true */
    var ServiceClass = baseServiceClass.extend({
      init:function() {
        this._super();
        this.endpoint = '/project-permissions/';
      },

      deletePermission: function(permission) {
        return this.$delete(this.getPermissionKey(permission));
      },

      getPermissionKey: function(url) {
        var arr = url.split('/');
        return arr[arr.length-2];
      }
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
