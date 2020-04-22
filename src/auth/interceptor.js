// @ngInject
function initAuthToken($auth, $http) {
  // When application starts up, we need to inject auth token if it exists
  const token = $auth.getToken();
  if (token) {
    $http.defaults.headers.common.Authorization = 'Token ' + token;
  }
}

// @ngInject
function invalidTokenInterceptor($injector, $q) {
  // On 401 error received, user session has expired and he should logged out
  // We need to use $injector in order to break circular dependency injection
  return {
    responseError: function(response) {
      const authService = $injector.get('authService');
      const $state = $injector.get('$state');
      const $stateParams = $injector.get('$stateParams');
      if (response.status === 401) {
        authService.localLogout(
          $state.current.name
            ? {
                toState: $state.current.name,
                toParams: JSON.parse(JSON.stringify($stateParams)),
              }
            : undefined,
        );
      }
      return $q.reject(response);
    },
  };
}

// @ngInject
export function abortRequestsInterceptor($injector) {
  const $q = $injector.get('$q');
  const $rootScope = $injector.get('$rootScope');

  let abortRequests;
  $rootScope.$on('abortRequests', function() {
    abortRequests = true;
  });
  $rootScope.$on('enableRequests', function() {
    abortRequests = false;
  });

  return {
    request: function(config) {
      // When user is logged out, all REST API requests are aborted.
      if (abortRequests && /\/api\//.test(config.url)) {
        const canceler = $q.defer();
        config.timeout = canceler.promise;
        canceler.resolve();
      }
      return config;
    },
  };
}

// @ngInject
function attachHttpInterceptor($httpProvider) {
  $httpProvider.interceptors.push(invalidTokenInterceptor);
  $httpProvider.interceptors.push(abortRequestsInterceptor);
}

// @ngInject
function requireAuth(
  $transitions,
  $auth,
  $rootScope,
  $uibModalStack,
  features,
  usersService,
) {
  $transitions.onStart(
    {
      to: state => state.data && state.data.auth && $auth.isAuthenticated(),
    },
    transition =>
      usersService.isCurrentUserValid().then(result => {
        if (result) {
          if (transition.to().name == 'initialdata.view') {
            return transition.router.stateService.target('profile.details');
          }
          return;
        }
        if (transition.to().name == 'initialdata.view') {
          return;
        }
        return transition.router.stateService.target('initialdata.view');
      }),
  );

  // If state parent is `auth` and user does not have authentication token,
  // he should be redirected to login page.
  $transitions.onStart(
    {
      to: state => state.data && state.data.auth && !$auth.isAuthenticated(),
    },
    transition =>
      transition.router.stateService.target('login', {
        toState: transition.to().name,
        toParams: JSON.parse(JSON.stringify(transition.params())),
      }),
  );

  // If state data has `anonymous` flag and user has authentication token,
  // he is redirected to dashboard.
  $transitions.onStart(
    {
      to: state =>
        state.data && state.data.anonymous && $auth.isAuthenticated(),
    },
    transition => transition.router.stateService.target('profile.details'),
  );

  // If state data has `feature` field and this feature is disabled,
  // user is redirected to 404 error page.
  $transitions.onStart(
    {
      to: state =>
        state.data &&
        state.data.feature &&
        !features.isVisible(state.data.feature),
    },
    transition => transition.router.stateService.target('errorPage.notFound'),
  );

  $transitions.onStart({}, transition => {
    const fromName = transition.from().name;
    if (fromName) {
      $rootScope.prevPreviousState = fromName;
      $rootScope.prevPreviousParams = JSON.parse(
        JSON.stringify(transition.params('from')),
      );
    }
  });

  $transitions.onSuccess({}, function() {
    $uibModalStack.dismissAll();
  });
}

export default module => {
  module.config(attachHttpInterceptor);
  module.run(requireAuth);
  module.run(initAuthToken);
};
