'use strict';

(function() {
  angular.module('ncsaas')
    .service('templatesService', ['baseServiceClass', templatesService]);

  function templatesService(baseServiceClass) {
    /*jshint validthis: true */
    var ServiceClass = baseServiceClass.extend({
      init:function() {
        this._super();
        this.endpoint = '/iaas-templates/';
      },
      getTemplateList: function(cloudUUID) {
        if (cloudUUID) {
          return this.getList({cloud: cloudUUID});
        } else {
          return this.getList();
        }
      }
    });
    return new ServiceClass();
  }

})();
