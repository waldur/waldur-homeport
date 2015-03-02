'use strict';

(function() {
  angular.module('ncsaas')
    .service('serviceService', ['$q', 'RawService', 'RawTemplate', 'currentStateService', serviceService]);

  function serviceService($q, RawService, RawTemplate, currentStateService) {
    /*jshint validthis: true */
    var vm = this;

    vm.getServiceList = getServiceList;
    vm.getService = getService;

    function getServiceList(filter) {
      var deferred = $q.defer();
      filter = filter || {};
      currentStateService.getCustomer().then(initServices, reject);

      function initServices(customer) {
        /*jshint camelcase: false */
        filter.customer_name = customer.name;
        RawService.query(filter).$promise.then(
          function(response) {
            deferred.resolve(response);
          },
          reject
        );
      }

      function reject(error) {
        deferred.reject(error);
      }

      return deferred.promise;
    }

    function getService(uuid) {
      return RawService.get({serviceUUID: uuid});
    }

  }

})();

(function() {
  angular.module('ncsaas')
    .factory('RawService', ['ENV', '$resource', RawService]);

    function RawService(ENV, $resource) {
      return $resource(ENV.apiEndpoint + 'api/clouds/:cloudUUID/', {cloudUUID:'@uuid'});
    }

})();
