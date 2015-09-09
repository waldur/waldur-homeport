'use strict';

// set auth token header
(function() {
  angular.module('ncsaas')
    .config(['$httpProvider', initAuthToken]);

  function initAuthToken($httpProvider) {
    $httpProvider.interceptors.push(auth);

    function auth($q, $window) {
      var headerIsSet = false;
      function request(data) {
        if (!headerIsSet) {
          var token = $window.localStorage['satellizer_token'];
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
      $authProvider.httpInterceptor = false;

      $authProvider.loginUrl = ENV.apiEndpoint + 'api-auth/password/';

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
