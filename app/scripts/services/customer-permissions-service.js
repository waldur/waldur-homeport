(function() {
  angular.module('ncsaas')
    .service('customerPermissionsService', ['$q', 'baseServiceClass', 'ncUtils', customerPermissionsService]);

  function customerPermissionsService($q, baseServiceClass, ncUtils) {
    var ServiceClass = baseServiceClass.extend({
      init:function() {
        this._super();
        this.endpoint = '/customer-permissions/';
        this.filterByCustomer = false;
      },

      deletePermission: function(permission) {
        return this.$delete(this.getPermissionKey(permission));
      },

      getPermissionKey: ncUtils.getUUID,

      userHasCustomerRole: function(username, role, customerUUID) {
        var deferred = $q.defer(),
          filter = {username: username};
        if (customerUUID) {
          /*jshint camelcase: false */
          filter.customer = customerUUID;
          this.filterByCustomer = false;
        } else {
          this.filterByCustomer = true;
        }

        this.getList(filter).then(function(permissions) {
          for (var i = 0; i < permissions.length; i++) {
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
})();
