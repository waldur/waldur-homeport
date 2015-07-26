'use strict';

(function() {
  angular.module('ncsaas')
    .service('resourcesService', ['baseServiceClass', 'ENV', '$http', '$q', resourcesService]);

  function resourcesService(baseServiceClass, ENV, $http, $q) {
    var ServiceClass = baseServiceClass.extend({
      endpoints: {
        'Instance': '/instances/',
        'Droplet': '/digitalocean-droplets/'
      },

      init:function() {
        this._super();
        this.stopResource = this.operation.bind(this, 'stop');
        this.startResource = this.operation.bind(this, 'start');
        this.restartResource = this.operation.bind(this, 'restart');
        this.endpoint = '/resources/';
      },

      getList: function(filter) {
        var vm = this;
        return this._super(filter).then(function(resources) {
          angular.forEach(resources, vm.initResource)
          return resources;
        })
      },

      initResource: function(resource) {
        var vm = this;

        resource.$delete = function(success, error) {
          var url = vm.getDetailUrl(resource.resource_type, resource.uuid);
          $http.delete(url).success(success).error(error);
        }

        resource.$update = function(success, error) {
          var url = vm.getDetailUrl(resource.resource_type, resource.uuid);
          $http.put(url, resource).success(success).error(error);
        }
      },

      $get: function(resource_type, uuid) {
        var vm = this;
        var url = this.getDetailUrl(resource_type, uuid);

        return $http.get(url).then(function(response){
          var resource = response.data;
          vm.initResource(resource);
          return resource;
        });
      },

      getDetailUrl: function(resource_type, uuid) {
        var endpoint = this.endpoints[resource_type];
        return ENV.apiEndpoint + 'api' + endpoint + uuid + '/';;
      },

      operation: function(operation, resource_type, uuid) {
        var vm = this;
        var url = vm.getDetailUrl(resource_type, uuid) + operation + '/';
        var deferred = $q.defer();

        $http.post(url).success(function(response) {
          deferred.resolve(response);
        }).error(function(err) {
          deferred.reject(err);
        });
        return deferred.promise;
      },

      getAvailableOperations: function(resource) {
        var state = resource.state.toLowerCase();
        if (state === 'online') {return ['stop', 'restart'];}
        if (state === 'offline') {return ['start', 'delete'];}
        return [];
      }
    });
    return new ServiceClass();
  }
})();
