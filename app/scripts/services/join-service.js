'use strict';


(function () {
  angular.module('ncsaas')
    .service('joinService', [
      '$q',
      'baseServiceClass',
      'servicesService',
      'digitalOceanService',
      joinService
    ]);

  function joinService(
    $q,
    baseServiceClass,
    servicesService,
    digitalOceanService
  ) {
    var ServiceClass = baseServiceClass.extend({
      providers: [servicesService, digitalOceanService],

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
          for (var i = 0; i < services.length; i++) {
            self.setProviderForService(services[i]);
          }
          deferred.resolve(services);
        });
        return deferred.promise;
      },

      $get: function(uuid) {
        var deferred = $q.defer();
        for (var i = 0; i < this.providers.length; i++) {
          this.providers[i].$get(uuid).then(function(response){
            if (response){
              deferred.resolve(response);
            }
          });
        };
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

      setProviderForService: function(service) {
        if (service.url.indexOf('digitalocean') > -1) {
          service.provider = 'DigitalOcean';
        } else {
          service.provider = 'OpenStack';
        }
      }
    });
    return new ServiceClass();
  }
})();
