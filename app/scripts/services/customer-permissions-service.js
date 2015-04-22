(function() {
  angular.module('ncsaas')
    .service('customerPermissionsService', ['$q', 'baseServiceClass', customerPermissionsService]);

  function customerPermissionsService($q, baseServiceClass) {
    var ServiceClass = baseServiceClass.extend({
      init:function() {
        this._super();
        this.endpoint = '/customer-permissions/';
      },

      userHasCustomerRole: function(user, role) {
        var deferred = $q.defer();

        this.getList({username: user.username}).then(function(permissions) {
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