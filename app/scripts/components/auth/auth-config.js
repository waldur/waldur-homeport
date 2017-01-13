// @ngInject
export default function initAuthProvider(ENV, $authProvider) {
  $authProvider.httpInterceptor = false;

  $authProvider.loginUrl = ENV.apiEndpoint + 'api-auth/password/';

  $authProvider.facebook({
    clientId: ENV.facebookClientId,
    url: ENV.apiEndpoint + 'api-auth/facebook/',
  });

  $authProvider.google({
    clientId: ENV.googleClientId,
    url: ENV.apiEndpoint + 'api-auth/google/'
  });

}
