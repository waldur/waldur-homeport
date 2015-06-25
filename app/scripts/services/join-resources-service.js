'use strict';

(function() {
  angular.module('ncsaas')
    .service('joinResourcesService', [
      '$q',
      'baseServiceClass', 
      'resourcesService',
      'digitalOceanResourcesService',
      joinResourcesService
    ]);

  function joinResourcesService(
    $q,
    baseServiceClass,
    resourcesService,
    digitalOceanResourcesService
    ) {
    var ServiceClass = baseServiceClass.extend({
      providers: [resourcesService, digitalOceanResourcesService],

      getList: function(filter) {
        var self = this;
        var promises = [];
        for (var i = 0; i < this.providers.length; i++) {
          var promise = this.providers[i].getList(filter);
          promises.push(promise);
        };
        var deferred = $q.defer();
        $q.all(promises).then(function(responses) {
          var services = self.flattenList(responses);
          deferred.resolve(services);
        });
        return deferred.promise;
      },

      flattenList: function(items) {
        var result = [];
        for (var i = 0; i < items.length; i++) {
          for (var j = 0; j < items[i].length; j++) {
            result.push(items[i][j]);
          }
        }
        return result;
      },

      getAvailableOperations:function(resource) {
        var state = resource.state.toLowerCase();
        if (state === 'online') {return ['stop', 'restart'];}
        if (state === 'offline') {return ['start', 'delete'];}
        return [];
      }
    });
    return new ServiceClass();
  }
})();
