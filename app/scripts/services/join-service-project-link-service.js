'use strict';


(function () {
  angular.module('ncsaas')
    .service('joinServiceProjectLinkService', [
      '$q',
      'baseServiceClass',
      'projectCloudMembershipsService',
      'projectsService',
      'currentStateService',
      joinServiceProjectLinkService
    ]);

  function joinServiceProjectLinkService(
    $q,
    baseServiceClass,
    projectCloudMembershipsService,
    projectsService,
    currentStateService
  ) {
    var ServiceClass = baseServiceClass.extend({
      getList: function(params) {
        var vm = this;
        if (params.service) {
          if (params.service.url.indexOf('digitalocean') > -1) {
            var deferred = $q.defer();
            for (var i = 0; i < params.service.projects.length; i++) {
              params.service.projects[i].project_name = params.service.projects[i].name;
            }
            deferred.resolve(params.service.projects);
            return deferred.promise;
          } else {
            return projectCloudMembershipsService.getList({cloud: params.service.uuid});
          }
        } else if (this.defaultFilter.project_uuid) {
          return projectsService.$get(this.defaultFilter.project_uuid).then(function(project) {
            vm.list = project.services;
            return vm.list;
          });
        } else {
          return currentStateService.getProject().then(function(project) {
            vm.list = project.services;
            return vm.list;
          });
        }
      },

      add: function(endpointUrl, service_url, project_url) {
        var instance = this.$create(endpointUrl);
        instance.project = project_url;
        instance.service = service_url;
        return instance.$save();
      }
    });
    return new ServiceClass();
  }
})();
