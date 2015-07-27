'use strict';


(function () {
  angular.module('ncsaas')
    .service('joinServiceProjectLinkService', [
      '$q',
      'baseServiceClass',
      'projectCloudMembershipsService',
      'digitalOceanServiceProjectLinkService',
      'projectsService',
      joinServiceProjectLinkService
    ]);

  function joinServiceProjectLinkService(
    $q,
    baseServiceClass,
    projectCloudMembershipsService,
    digitalOceanServiceProjectLinkService,
    projectsService
  ) {
    var ServiceClass = baseServiceClass.extend({
      getList: function(params) {
        if (params.service) {
          if (params.service.url.indexOf('digitalocean') > -1) {
            var deferred = $q.defer();
            for (var i = 0; i < params.service.projects.length; i++) {
              params.service.projects[i].project_name = params.service.projects[i].name;
            };
            deferred.resolve(params.service.projects);
            return deferred.promise;
          } else {
            return projectCloudMembershipsService.getList({cloud: params.service.uuid});
          }
        } else if (params.project_uuid) {
          return projectsService.$get(params.project_uuid).then(function(project) {
            project.services.forEach(function(project) {
              if (project.url.indexOf('digitalocean') > -1) {
                project.resource_type = 'digitalocean';
              } else {
                project.resource_type = 'openstack';
              }
            })
            return project.services;
          })
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
