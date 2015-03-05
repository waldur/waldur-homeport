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
    vm.deleteResource = deleteResource;

    vm.createResource = createResource;
    vm.getAvailableOperations = getAvailableOperations;

    vm.pageSize = 10;
    vm.page = 1;
    vm.pages = null;


    function getRawResourcesList() {
      return RawResource.query();
    }

    function getResourcesList(filter) {
      var deferred = $q.defer();
      filter = filter || {};
      currentStateService.getCustomer().then(function(response) {
        /*jshint camelcase: false */
        filter.customer_name = response.name;
        filter.page = vm.page;
        filter.page_size = vm.pageSize;
        RawResource.query(filter,function(response, responseHeaders){
          var header = responseHeaders(),
            objQuantity = header['x-result-count']? header['x-result-count'] : null;
          if (objQuantity) {
            vm.pages = Math.ceil(objQuantity/vm.pageSize);
          }
          deferred.resolve(response);
        }, function(err) {
          deferred.reject(err);
        });

      }, function(err) {
        deferred.reject(err);
      });
      return deferred.promise;
    }

    function resourceOperation(operation, uuid) {
      var deferred = $q.defer();
      RawInstance.Operation({uuid: uuid, operation: operation}).$promise.then(function(response){
        deferred.resolve(response);
      }, function(err) {
        deferred.reject(err);
      });
      return deferred.promise;
    }

    function createResource() {
      return new RawInstance();
    }

    function deleteResource(uuid) {
      var deferred = $q.defer();
      RawInstance.Delete({},{uuid: uuid}).$promise.then(function(response) {
        deferred.resolve(response);
      }, function(err) {
        deferred.reject(err);
      });
      return deferred.promise;
    }

    function getAvailableOperations(resource) {
      var state = resource.state.toLowerCase();
      if (state === 'online') {return ['stop', 'restart'];}
      if (state === 'offline') {return ['start', 'delete'];}
      return [];
    }

  }
})();

(function() {
  angular.module('ncsaas')
    .factory('RawResource', ['ENV', '$resource', RawResource]);

  function RawResource(ENV, $resource) {
    return $resource(ENV.apiEndpoint + 'api/resources/',{page_size:'@page_size', page:'@page'});
  }
})();

// Instance - one resource implementations. Thar why RawInstance factory locates in this file
(function() {
  angular.module('ncsaas')
    .factory('RawInstance', ['ENV', '$resource', RawInstance]);

  function RawInstance(ENV, $resource) {
    return $resource(ENV.apiEndpoint + 'api/instances/:instanceUUID/', {instanceUUID:'@uuid'},
      {
        Operation: {
          method:'POST',
          url:ENV.apiEndpoint + 'api/instances/:instanceUUID/:operation/',
          params: {instanceUUID:'@uuid', operation:'@operation'}
        },
        Delete: {
          method:'DELETE'
        }
      }
    );
  }

})();
