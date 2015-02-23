'use strict';

// XXX: Instance service have to be deleted
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

// TODO: Merge with actual resource service
(function() {
  angular.module('ncsaas')
    .service('resourceService', ['RawInstance', resourceService]);

  function resourceService(RawInstance) {
    /*jshint validthis: true */
    var vm = this;

    function createResource() {
      return new RawInstance();
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
