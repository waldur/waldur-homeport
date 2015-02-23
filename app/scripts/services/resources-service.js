'use strict';

(function() {
  angular.module('ncsaas')
    .service('resourcesService', ['RawResource', 'RawProject', 'currentStateService', '$q', resourcesService]);

  function resourcesService(RawResource, RawProject, currentStateService, $q) {
    /*jshint validthis: true */
    var vm = this;
    vm.getResourcesList = getResourcesList;
    vm.getRawResourcesList = getRawResourcesList;

    function getRawResourcesList() {
      return RawResource.query();
    }
    function getResourcesList() {
      var deferred = $q.defer();
      currentStateService.getCustomer().then(function(response) {
        var customerName = response.name,
        /*jshint camelcase: false */
            resources = RawResource.query({customer_name: customerName}, init);

            function init(resources) {
              for (var i = 0; i < resources.length; i++) {
                initResourceProject(resources[i]);
              }
            }

            function initResourceProject(resource) {
              return RawProject.query(init);
              function init(projects) {
                for (var i = 0; i < projects.length; i++) {
                  if (projects[i].name === resource.project_name) {
                    var new_project = projects[i];
                  }
                }
                resource.project = new_project;
              }
            }

        deferred.resolve(resources);
      }, function(err) {
        deferred.reject(err);
      });
      return deferred.promise;
    }

  }
})();

(function() {
  angular.module('ncsaas')
    .factory('RawResource', ['ENV', '$resource', RawResource]);

  function RawResource(ENV, $resource) {
    return $resource(
      ENV.apiEndpoint + 'api/resources/', {},
      {
      }
    );
  }
})();
