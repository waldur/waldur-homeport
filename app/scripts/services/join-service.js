'use strict';


(function () {
  angular.module('ncsaas')
    .service('joinService', [
      '$q',
      'baseServiceClass',
      'servicesService',
      joinService
    ]);

  function joinService(
    $q,
    baseServiceClass,
    servicesService
  ) {
    var ServiceClass = baseServiceClass.extend({
      getList: function(filter) {
        filter = filter || {};
        for (var key in this.defaultFilter) {
          filter[key] = this.defaultFilter[key];
        }
        var getList = this._super.bind(this);
        var vm = this;
        vm.cacheReset = true;
        return servicesService.getServicesList().then(function(services) {
          var promises = [];
          angular.forEach(services, function(service, name) {
            var promise = getList(filter, service.url).then(function(services) {
              services.forEach(function(service) {
                service.provider = name;
              });
              return services;
            });
            promises.push(promise);
          });
          return $q.all(promises).then(function(responses) {
            return vm.flattenList(responses);
          });
        });
      },

      $get: function(provider, uuid) {
        var get = this._super.bind(this);
        return servicesService.getServicesList().then(function(services) {
          return get(uuid, services[provider].url);
        });
      },

      flattenList: function(items) {
        var result = [];
        for (var i = 0; i < items.length; i++) {
          for (var j = 0; j < items[i].length; j++) {
            result.push(items[i][j]);
          }
        }
        return result;
      }
    });
    return new ServiceClass();
  }
})();
