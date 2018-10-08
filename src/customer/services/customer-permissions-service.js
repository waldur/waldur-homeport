// @ngInject
export default function customerPermissionsService($q, baseServiceClass, ncUtils) {
  let ServiceClass = baseServiceClass.extend({
    init:function() {
      this._super();
      this.endpoint = '/customer-permissions/';
    },

    deletePermission: function(permission) {
      return this.$delete(this.getPermissionKey(permission));
    },

    getPermissionKey: ncUtils.getUUID,

    userHasCustomerRole: function(username, role, customerUUID) {
      let deferred = $q.defer(),
        filter = {username: username};
      if (customerUUID) {
        filter.customer = customerUUID;
      }

      this.getList(filter).then(function(permissions) {
        for (let i = 0; i < permissions.length; i++) {
          if (permissions[i].role === role) {
            deferred.resolve(true);
          }
        }
        deferred.resolve(false);
      }, function(err) {
        deferred.reject(err);
      });

      return deferred.promise;
    }

  });
  return new ServiceClass();
}
