'use strict';

(function() {
  angular.module('ncsaas')
    .service('cloudsService', ['ENV', '$resource', 'projectsService', cloudsService]);

  function cloudsService(ENV, $resource, projectsService, $cookies) {
    /*jshint validthis: true */
    var vm = this;
    vm.cloudResource = $resource(ENV.apiEndpoint + 'api/clouds/:cloudUUID/', {cloudUUID:'@uuid'});

  }

})();

(function() {
  angular.module('ncsaas')
    .factory('RawCloud', ['ENV', '$resource', RawCloud]);

    function RawCloud(ENV, $resource) {
      return $resource(ENV.apiEndpoint + 'api/clouds/:cloudUUID/', {cloudUUID:'@uuid'});
    }

})();
