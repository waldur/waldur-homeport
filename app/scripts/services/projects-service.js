'use strict';

(function() {
  angular.module('ncsaas')
    .service('projectsService', ['ENV', '$resource', projectsService]);

  function projectsService(ENV, $resource, $cookies) {
    /*jshint validthis: true */
    var vm = this;
    vm.projectResource = $resource(ENV.apiEndpoint + 'api/projects/:projectUUID/', {projectUUID:'@uuid'}, {
        update: {
          method: 'PUT'
        }
    });

  }

})();
