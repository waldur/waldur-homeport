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
      currentStateService.getCustomer().then(function(response) {
        /*jshint camelcase: false */
        filter.customer_name = response.name;
        var clouds = RawCloud.query(filter);
        deferred.resolve(clouds);
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
