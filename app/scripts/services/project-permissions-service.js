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
      }
    });
    return new ServiceClass();
  }

})();

(function() {
  angular.module('ncsaas').constant('USERPROJECTROLE', {
    admin: 'admin'
  });
})();
