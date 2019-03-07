export default module => {
  module.config(attachHttpInterceptor);
  module.run(requireAuth);
  module.run(initAuthToken);
};

// @ngInject
function attachHttpInterceptor($httpProvider) {
  // On 401 error received, user session has expired and he should logged out
  // We need to use $injector in order to break circular dependency injection
  $httpProvider.interceptors.push(invalidTokenInterceptor);
}

// @ngInject
function invalidTokenInterceptor($injector, $q) {
  return {
    responseError: function(response) {
      const authService = $injector.get('authService');
      const $state = $injector.get('$state');
      // Erred state is terminal, user should not be redirected from erred state to login
      // so that he would be able to read error message details
      if (response.status === 401 && (!$state.current.data || !$state.current.data.erred)) {
        authService.localLogout();
      }
      return $q.reject(response);
    }
  };
}

// @ngInject
function requireAuth($rootScope, $state, $auth, $window) {
  // If state parent is `auth` and user does not have authentication token,
  // he should be redirected to login page.

  $rootScope.$on('$stateChangeStart', function(event, toState, toParams) {
    if (!$auth.isAuthenticated()) {
      saveAttemptState($window, toState, toParams);
    }
    if (toState.data && toState.data.auth && !$auth.isAuthenticated()) {
      event.preventDefault();
      $state.go('login');
    }
  });
}

// @ngInject
function initAuthToken($auth, $http) {
  // When application starts up, we need to inject auth token if it exists
  const token = $auth.getToken();
  if (token) {
    $http.defaults.headers.common.Authorization = 'Token ' + token;
  }
}

function saveAttemptState($window, toState, toParams) {
  if (toState.data.auth) {
    const nextState = JSON.stringify({state: toState.name, params: toParams});
    $window.localStorage.setItem('goToStateAfterLogin', nextState);
  }
}
