(function() {
  angular.module('ncsaas')
    .service('customerPermissionsService', ['baseServiceClass', customerPermissionsService]);

  function customerPermissionsService(baseServiceClass) {
    var ServiceClass = baseServiceClass.extend({
      init:function() {
        this._super();
        this.endpoint = '/customer-permissions/';
      },
    });
    return new ServiceClass();
  }
})();