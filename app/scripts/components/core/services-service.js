// @ngInject
export default function servicesService(baseServiceClass, $q) {
  var ServiceClass = baseServiceClass.extend({
    services: null,

    init:function() {
      this._super();
    },
    getServicesList: function() {
      var vm = this,
        deferred = $q.defer();
      vm.endpoint = '/service-metadata/';
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
