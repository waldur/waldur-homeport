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
        resources = RawResource.query({customer_name: customerName});
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
