'use strict';

(function() {
  angular.module('ncsaas')
    .service('servicesService', ['baseServiceClass', '$q', servicesService]);

  function servicesService(baseServiceClass, $q) {
    /*jshint validthis: true */
    var ServiceClass = baseServiceClass.extend({
      services: null,

      init:function() {
        this._super();
        this.endpoint = '/services/';
      },
      getServicesList: function() {
        var vm = this,
          deferred = $q.defer();

        if (vm.services) {
          deferred.resolve(vm.services.toJSON());
        } else {
          vm.$get().then(function(response) {
            vm.services = response;
            deferred.resolve(vm.services.toJSON());
          });
        }

        return deferred.promise;
      }
    });
    return new ServiceClass();
  }

})();
