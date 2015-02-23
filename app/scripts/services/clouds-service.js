'use strict';

(function() {
  angular.module('ncsaas')
    .service('cloudsService', ['RawCloud', 'RawTemplate', cloudsService]);

  function cloudsService(RawCloud, RawTemplate) {
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

    function getCloudTemplates(cloudUUID) {
      return RawTemplate.query({cloud: cloudUUID});
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

// This factory has to be moved to template service if this service will be created
(function() {
  angular.module('ncsaas')
    .factory('RawTemplate', ['ENV', '$resource', RawTemplate]);

    function RawTemplate(ENV, $resource) {
      return $resource(ENV.apiEndpoint + 'api/templates/:templateUUID/', {templateUUID:'@uuid'});
    }

})();
