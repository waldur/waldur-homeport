'use strict';

(function () {
  angular.module('ncsaas')
    .service('joinServiceProjectLinkService', [
      '$q',
      'baseServiceClass',
      'currentStateService',
      'joinService',
      'projectsService',
      joinServiceProjectLinkService
    ]);

  function joinServiceProjectLinkService(
    $q,
    baseServiceClass,
    currentStateService,
    joinService,
    projectsService
    ) {
    var ServiceClass = baseServiceClass.extend({
      addProject: function(project) {
        // Connect project with all services of current customer
        var vm = this;
        var query = {customer_uuid: currentStateService.getCustomerUuid()};
        return joinService.getList(query).then(function(services) {
          var private_services = services.filter(function(service) {
            return !service.shared;
          });
          var promises = private_services.map(function(service) {
            return joinService.getServiceProjectLinkUrlByType(service.service_type).then(function(spl) {
              return vm.add(spl, service.url, project.url);
            });
          });
          return $q.all(promises);
        });
      },
      addService: function(service) {
        // Connect service with all projects of current customer
        var vm = this;
        return joinService.getServiceProjectLinkUrlByType(service.service_type).then(function(spl) {
          var query = {customer: currentStateService.getCustomerUuid()};
          return projectsService.getList(query).then(function(projects) {
            var promises = projects.map(function(project) {
              return vm.add(spl, service.url, project.url);
            });
            return $q.all(promises);
          });
        });
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
