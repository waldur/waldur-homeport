'use strict';

(function() {
  angular.module('ncsaas')
    .service('cloudsService', ['$q', 'RawCloud', 'RawTemplate', 'currentStateService', cloudsService]);

  function cloudsService($q, RawCloud, RawTemplate, currentStateService) {
    /*jshint validthis: true */
    var vm = this;

    vm.getCloudList = getCloudList;
    vm.getCloud = getCloud;

    function getCloudList() {
      var deferred = $q.defer();
      currentStateService.getCustomer().then(function(response) {
        var customerName = response.name,
        /*jshint camelcase: false */
            resources = RawCloud.query({customer_name: customerName});
        deferred.resolve(resources);
      }, function(err) {
        deferred.reject(err);
      });
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
