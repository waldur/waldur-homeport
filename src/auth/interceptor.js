import Axios from 'axios';
import Qs from 'qs';

import { ngInjector } from '@waldur/core/services';

// @ngInject
function initAuthToken($auth, $http) {
  // When application starts up, we need to inject auth token if it exists
  const token = $auth.getToken();
  if (token) {
    Axios.defaults.headers.common['Authorization'] = 'Token ' + token;
    $http.defaults.headers.common['Authorization'] = 'Token ' + token;
  }
}

Axios.defaults.paramsSerializer = params =>
  Qs.stringify(params, { arrayFormat: 'repeat' });

// On 401 error received, user session has expired and he should logged out
Axios.interceptors.response.use(
  function(response) {
    return response;
  },
  function invalidTokenInterceptor(error) {
    if (error.response && error.response.status === 401 && ngInjector) {
      const authService = ngInjector.get('authService');
      const $state = ngInjector.get('$state');
      const $stateParams = ngInjector.get('$stateParams');

      authService.localLogout(
        $state.current.name
          ? {
              toState: $state.current.name,
              toParams: JSON.parse(JSON.stringify($stateParams)),
            }
          : undefined,
      );
    } else {
      // See also: https://github.com/axios/axios/issues/960
      return Promise.reject(error.response);
    }
  },
);

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
  module.run(requireAuth);
  module.run(initAuthToken);
};
