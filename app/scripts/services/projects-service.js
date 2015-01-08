'use strict';

(function() {
  angular.module('ncsaas')
    .service('projectsService', ['ENV', '$http', projectsService]);

  function projectsService(ENV, $resource, $cookies) {
    /*jshint validthis: true */
    var vm = this;
    vm.list = list;
    vm.projectResource = $resource(ENV.apiEndpoint + 'api/projects/:projectId', {projectId:'@id'});

    function list() {
      return vm.projectResource.query();
    }

  }

})();
