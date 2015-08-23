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
        var vm = this;
        var fn = this._super.bind(vm);
        return servicesService.getServicesList().then(function(services) {
          var promises = [];
          for(var name in services) {
            var endpointUrl = services[name].url;
            var promise = fn(filter, endpointUrl).then(function(services) {
              services.forEach(function(service) {
                service.provider = name;
              })
              return services;
            });
            promises.push(promise);
          }
          return $q.all(promises).then(function(responses) {
            return vm.flattenList(responses);
          });
        });
      },

      $get: function(provider, uuid) {
        var vm = this;
        return servicesService.getServicesList().then(function(services) {
          var endpointUrl = services[provider].url + uuid + '/';
          return vm.getFactory(false, null, endpointUrl).get().$promise
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
