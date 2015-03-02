'use strict';

(function() {
  angular.module('ncsaas')
    .service('serviceService', ['RawService', serviceService]);

  function serviceService(RawService) {
    /*jshint validthis: true */
    var vm = this;

    vm.getServiceList = getServiceList;
    vm.getService = getService;

    function getServiceList() {
      return RawService.query();
    }

    function getService(uuid) {
      return RawService.get({cloudUUID: uuid});
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
