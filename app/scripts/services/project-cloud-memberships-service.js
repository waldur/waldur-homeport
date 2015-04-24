'use strict';

(function() {
  angular.module('ncsaas')
    .service('projectCloudMembershipsService', ['baseServiceClass', projectCloudMembershipsService]);

  function projectCloudMembershipsService(baseServiceClass) {
    /*jshint validthis: true */
    var ServiceClass = baseServiceClass.extend({
      init:function() {
        this._super();
        this.endpoint = '/project-cloud-memberships/';
      },
      addRow:function(project, cloud) {
        var instance = this.$create();
        instance.project = project;
        instance.cloud = cloud;
        instance.$save();
      }
    });
    return new ServiceClass();
  }

})();
