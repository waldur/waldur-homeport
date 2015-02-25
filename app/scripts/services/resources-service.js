'use strict';

(function() {
  angular.module('ncsaas')
    .service('resourcesService', ['RawResource', 'RawInstance', 'currentStateService', '$q', resourcesService]);

  function resourcesService(RawResource, RawInstance, currentStateService, $q) {
    /*jshint validthis: true */
    var vm = this;
    vm.getResourcesList = getResourcesList;
    vm.getRawResourcesList = getRawResourcesList;
    vm.createResource = createResource;

    function getRawResourcesList() {
      return RawResource.query();
    }

    function getResourcesList(filter) {
      var deferred = $q.defer();
      filter = filter || {};
      currentStateService.getCustomer().then(function(response) {
        /*jshint camelcase: false */
        filter.customer_name = response.name;
        var resources = RawResource.query(filter);
        deferred.resolve(resources);
      }, function(err) {
        deferred.reject(err);
      });
      return deferred.promise;
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
    return $resource(ENV.apiEndpoint + 'api/instances/:instanceUUID/', {instanceUUID:'@uuid'});
  }
})();
