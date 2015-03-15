'use strict';

(function() {
  angular.module('ncsaas')
    .service('resourcesService', ['RawResource', 'RawInstance', 'currentStateService', '$q',
      'baseServiceClass', resourcesService]);

  function resourcesService(RawResource, RawInstance, currentStateService, $q, baseServiceClass) {
    var ServiceClass = baseServiceClass.extend({
      init:function() {
        this.stopResource = this.resourceOperation.bind(null, 'stop');
        this.startResource = this.resourceOperation.bind(null, 'start');
        this.restartResource = this.resourceOperation.bind(null, 'restart');
        this.rawFabric = RawResource;
        this.rawInstance = RawInstance;
        this.currentStateService = currentStateService;
        this.createResource = this.createInstance;
        this.getResourceList = this.getInstanceList;
        this.deleteResource = this.deleteInstance.bind(this, 'uuid');
        this.getResource = this.getFactoryItem.bind(this, 'uuid');
        this._super();
      },
      getRawResourcesList:function() {
        return RawResource.query();
      },
      resourceOperation:function(operation, uuid) {
        var deferred = $q.defer();
        RawInstance.Operation({uuid: uuid, operation: operation}).$promise.then(function(response){
          deferred.resolve(response);
        }, function(err) {
          deferred.reject(err);
        });
        return deferred.promise;
      },
      getAvailableOperations:function(resource) {
        var state = resource.state.toLowerCase();
        if (state === 'online') {return ['stop', 'restart'];}
        if (state === 'offline') {return ['start', 'delete'];}
        return [];
      },
      getFactoryItem:function(uuid) {
        var params = {resourceUUID: uuid};
        return this._super(params);
      },
      deleteInstance:function(uuid) {
        var params = {uuid: uuid};
        return this._super(params);
      }
    });
    return new ServiceClass();
  }
})();

(function() {
  angular.module('ncsaas')
    .factory('RawResource', ['ENV', '$resource', RawResource]);

  function RawResource(ENV, $resource) {
    return $resource(ENV.apiEndpoint + 'api/resources/:resourceUUID/',{page_size:'@page_size', page:'@page'});
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
