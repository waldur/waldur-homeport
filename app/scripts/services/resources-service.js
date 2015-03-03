'use strict';

(function() {
  angular.module('ncsaas')
    .service('resourcesService', ['RawResource', 'RawInstance', 'currentStateService', '$q', resourcesService]);

  function resourcesService(RawResource, RawInstance, currentStateService, $q) {
    var ServiceClass = BaseServiceClass.extend({
      init:function() {
        this.stopResource = this.resourceOperation.bind(null, 'stop');
        this.startResource = this.resourceOperation.bind(null, 'start');
        this.restartResource = this.resourceOperation.bind(null, 'restart');
        this.pageSize = 10;
        this.page = 1;
        this.pages = null;
      },
      getRawResourcesList:function() {
        return RawResource.query();
      },
      getResourcesList:function(filter) {
        var vm = this;
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
      createResource:function() {
        return new RawInstance();
      },
      deleteResource:function(uuid) {
        var deferred = $q.defer();
        RawInstance.Delete({},{uuid: uuid}).$promise.then(function(response) {
          deferred.resolve(response);
        }, function(err) {
          deferred.reject(err)
        });
        return deferred.promise;
      }
    });
    return new ServiceClass();
  }
})();

(function() {
  angular.module('ncsaas')
    .factory('RawResource', ['ENV', '$resource', RawResource]);

  function RawResource(ENV, $resource) {
    var FactoryClass = BaseFactoryClass.extend({
      init:function(){
        this.url = 'api/resources/';
        this.params = {page_size:'@page_size', page:'@page'};
        this.ENV = ENV;
        this.$resource = $resource;
        this._super();
      },
      raw:function() {
        return this._super();
      }
    });
    var FactoryClassInit = new FactoryClass();
    return FactoryClassInit.raw();
  }
})();

// Instance - one resource implementations. Thar why RawInstance factory locates in this file
(function() {
  angular.module('ncsaas')
    .factory('RawInstance', ['ENV', '$resource', RawInstance]);

  function RawInstance(ENV, $resource) {
    var FactoryClass = BaseFactoryClass.extend({
      init:function(){
        this.url = 'api/instances/:instanceUUID';
        this.params = {instanceUUID:'@uuid'};
        this.config = {
          Operation: {
            method:'POST',
            url:'api/instances/:instanceUUID/:operation',
            params: {instanceUUID:'@uuid', operation:'@operation'}
          },
          Delete: {
            method:'DELETE'
          }
        };
        this.ENV = ENV;
        this.$resource = $resource;
        this._super();
      },
      raw:function() {
        return this._super();
      }
    });
    var FactoryClassInit = new FactoryClass();
    return FactoryClassInit.raw();
  }

})();
