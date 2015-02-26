'use strict';

(function() {
  angular.module('ncsaas')
    .service('resourcesService', ['RawResource', 'RawInstance', 'currentStateService', '$q', resourcesService]);

  function resourcesService(RawResource, RawInstance, currentStateService, $q) {
    /*jshint validthis: true */
    var vm = this;
    vm.getResourcesList = getResourcesList;
    vm.getRawResourcesList = getRawResourcesList;

    vm.stopResource = resourceOperation.bind(null, 'stop');
    vm.startResource = resourceOperation.bind(null, 'start');
    vm.restartResource = resourceOperation.bind(null, 'restart');

    vm.createResource = createResource;


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

    function resourceOperation(operation, uuid) {
      RawInstance.Operation({uuid: uuid, operation: operation}).$promise.then( function(response){

      });
    }

    function createResource() {
      return new RawInstance();
    }

  }
})();

(function() {
  angular.module('ncsaas')
    .factory('RawResource', ['ENV', '$resource', RawResource]);

  function RawResource(ENV, $resource) {
    return $resource(ENV.apiEndpoint + 'api/resources/');
  }
})();

// Instance - one resource implementations. Thar why RawInstance factory locates in this file
(function() {
  angular.module('ncsaas')
    .factory('RawInstance', ['ENV', '$resource', RawInstance]);

  function RawInstance(ENV, $resource) {
    return $resource(ENV.apiEndpoint + 'api/instances/:instanceUUID', {instanceUUID:'@uuid'
        },
      {
        Operation: {
          method:'POST',
          url:ENV.apiEndpoint + 'api/instances/:instanceUUID/:operation',
          params: {instanceUUID:'@uuid', operation:'@operation'}
        }
      });
  }

})();
