'use strict';

(function() {
  angular.module('ncsaas')
    .service('instancesService', ['RawInstance', instancesService]);

  function instancesService(RawInstance) {
    /*jshint validthis: true */
    var vm = this;

    vm.getInstanceList = getInstanceList;
    vm.getInstance = getInstance;

    function getInstanceList() {
      return RawInstance.query();
    }

    function getInstance(uuid) {
      return RawInstance.get({instanceUUID: uuid});
    }

  }

})();

(function() {
  angular.module('ncsaas')
    .factory('RawInstance', ['ENV', '$resource', RawInstance]);

    function RawInstance(ENV, $resource) {
      return $resource(ENV.apiEndpoint + 'api/instances/:instanceUUID/', {instanceUUID:'@uuid'});
    }

})();
