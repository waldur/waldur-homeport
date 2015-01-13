'use strict';

// set auth token header
(function() {
  angular.module('ncsaas')
    .config(['$httpProvider', initAuthToken]);

  function initAuthToken($httpProvider) {
    $httpProvider.interceptors.push(auth);

    function auth($q, $cookies) {
      var headerIsSet = false;
      function request(data) {

        if (!headerIsSet) {
          var token = $cookies.token;
          if (typeof token !== 'undefined' && token !== 'undefined') {
            $httpProvider.defaults.headers.common.Authorization = 'Token ' + token;
            headerIsSet = true;
          }
        }
        return data;
      }

      function responseError(rejection) {
        return $q.reject(rejection);
      }
      return {
        request: request,
        responseError: responseError
      };
    }

  }

})();

// social auth
(function() {
  angular.module('ncsaas')
    .config(['ENV', '$authProvider', initAuthProvider]);

    function initAuthProvider(ENV, $authProvider) {

      $authProvider.facebook({
        clientId: '654736081301402',
        url: 'http://localhost:8080/api-auth/facebook/',
      });

      $authProvider.google({
        clientId: ENV.googleCliendId,
        url: ENV.apiEndpoint + ENV.googleEndpointUrl,
      });

    }

})();
