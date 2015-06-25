'use strict';


(function () {
  angular.module('ncsaas')
    .service('joinServiceProjectLinkService', [
      '$q',
      'baseServiceClass',
      'projectCloudMembershipsService',
      'digitalOceanServiceProjectLinkService',
      joinServiceProjectLinkService
    ]);

  function joinServiceProjectLinkService(
    $q,
    baseServiceClass,
    projectCloudMembershipsService,
    digitalOceanServiceProjectLinkService
  ) {
    var ServiceClass = baseServiceClass.extend({
      getList: function(service) {
        if (service.url.indexOf('digitalocean') > -1) {
          var deferred = $q.defer();
          for (var i = 0; i < service.projects.length; i++) {
            service.projects[i].project_name = service.projects[i].name;
          };
          deferred.resolve(service.projects);
          return deferred.promise;
        } else {
          return projectCloudMembershipsService.getList({cloud: service.uuid});
        }
      },

      add: function(project, service) {
        if (service.url.indexOf('digitalocean') > -1) {
          var instance = digitalOceanServiceProjectLinkService.$create();
          instance.project = project.url;
          instance.service = service.url;
          instance.$save();
        } else {
          projectCloudMembershipsService.addRow(project.url, service.url);
        }
      }
    });
    return new ServiceClass();
  }
})();
