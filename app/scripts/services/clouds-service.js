'use strict';

(function() {
  angular.module('ncsaas')
    .service('cloudsService', ['$q', 'RawCloud', 'RawTemplate', 'currentStateService', cloudsService]);

  function cloudsService($q, RawCloud, RawTemplate, currentStateService) {
    /*jshint validthis: true */
    var vm = this;

    vm.getCloudList = getCloudList;
    vm.getCloud = getCloud;

    function getCloudList(filter) {
      var deferred = $q.defer();
      filter = filter || {};
      currentStateService.getCustomer().then(initClouds, reject);

      function initClouds(customer) {
        /*jshint camelcase: false */
        filter.customer_name = customer.name;
        RawCloud.query(filter).$promise.then(
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

    function getCloud(uuid) {
      return RawCloud.get({cloudUUID: uuid});
    }

  }

})();

(function() {
  angular.module('ncsaas')
    .factory('RawCloud', ['ENV', '$resource', RawCloud]);

    function RawCloud(ENV, $resource) {
      return $resource(ENV.apiEndpoint + 'api/clouds/:cloudUUID/', {cloudUUID:'@uuid'});
    }

})();
