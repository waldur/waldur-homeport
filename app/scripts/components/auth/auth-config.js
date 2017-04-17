// @ngInject
export default function initAuthProvider(ENV, $authProvider) {
  $authProvider.httpInterceptor = false;

  $authProvider.loginUrl = ENV.apiEndpoint + 'api-auth/password/';

  if (ENV.facebookClientId) {
    $authProvider.facebook({
      clientId: ENV.facebookClientId,
      url: ENV.apiEndpoint + 'api-auth/facebook/',
    });
  }

  if (ENV.googleClientId) {
    $authProvider.google({
      clientId: ENV.googleClientId,
      url: ENV.apiEndpoint + 'api-auth/google/'
    });
  }

  if (ENV.smartIdClientId) {
    $authProvider.oauth2({
      name: 'smartid',
      clientId: ENV.smartIdClientId,
      url: ENV.apiEndpoint + 'api-auth/smartidee/',
      authorizationEndpoint: 'https://id.smartid.ee/oauth/authorize',
      redirectUri: window.location.origin,
    });
  }
}
