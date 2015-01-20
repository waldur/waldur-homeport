'use strict';

(function() {
  angular.module('ncsaas')
    .service('cloudsService', ['ENV', '$resource', cloudsService]);

  function cloudsService(ENV, $resource, $cookies) {
    /*jshint validthis: true */
    var vm = this;
    vm.cloudResource = $resource(ENV.apiEndpoint + 'api/clouds/:cloudUUID/', {cloudUUID:'@uuid'});

  }

})();
