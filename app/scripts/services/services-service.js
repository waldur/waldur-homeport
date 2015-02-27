'use strict';

(function() {
  angular.module('ncsaas')
    .service('cloudsService', ['RawCloud', cloudsService]);

  function cloudsService(RawCloud) {
    /*jshint validthis: true */
    var vm = this;

    vm.getCloudList = getCloudList;
    vm.getCloud = getCloud;

    function getCloudList() {
      return RawCloud.query();
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
