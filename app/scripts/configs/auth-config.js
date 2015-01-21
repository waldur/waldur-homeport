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
        clientId: ENV.facebookClientId,
        url: ENV.apiEndpoint + ENV.facebookEndpointUrl
      });

      $authProvider.google({
        clientId: ENV.googleClientId,
        url: ENV.apiEndpoint + ENV.googleEndpointUrl
      });

    }

})();
