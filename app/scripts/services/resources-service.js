'use strict';

(function() {
  angular.module('ncsaas')
    .service('resourcesService', ['RawResource', 'currentStateService', '$q', resourcesService]);

  function resourcesService(RawResource, currentStateService, $q) {
    var vm = this;
    vm.getResourcesList = getResourcesList;
    vm.getRawResourcesList = getRawResourcesList;

    function getRawResourcesList() {
      return RawResource.query();
    }
    function getResourcesList() {
      var deferred = $q.defer();
      currentStateService.getCustomer().then(function(response){
        var customerName = response.name;
        var resources = RawResource.query({customer_name: customerName});
        deferred.resolve(resources);
      }, function(err){
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
        update: {
          method: 'PUT'
        }
      }
    );
  }
})();
