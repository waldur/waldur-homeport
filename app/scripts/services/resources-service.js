'use strict';

(function() {
  angular.module('ncsaas')
    .service('resourcesService', ['RawResource', 'RawInstance', 'currentStateService', '$q', resourcesService]);

  function resourcesService(RawResource, RawInstance, currentStateService, $q) {
    /*jshint validthis: true */
    var vm = this;
    vm.getResourcesList = getResourcesList;
    vm.getRawResourcesList = getRawResourcesList;
    vm.stopResource = resourceSSROperation.bind('stop', null);
    vm.startResource = resourceSSROperation.bind('start', null);
    vm.restartResource = resourceSSROperation.bind('restart', null);

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
    function resourceSSROperation(operation, resource) {
      RawInstance.SSROperation({instanceUUID: resource.uiid, operation: operation}, function(responce){
        console.log(responce);
      });
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
