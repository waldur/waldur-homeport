// @ngInject
export default function initAuthProvider(ENV, $authProvider) {
  $authProvider.httpInterceptor = false;

  $authProvider.loginUrl = ENV.apiEndpoint + 'api-auth/password/';

  if (ENV.plugins.WALDUR_AUTH_SOCIAL.FACEBOOK_CLIENT_ID) {
    $authProvider.facebook({
      clientId: ENV.plugins.WALDUR_AUTH_SOCIAL.FACEBOOK_CLIENT_ID,
      url: ENV.apiEndpoint + 'api-auth/facebook/',
    });
  }

  if (ENV.plugins.WALDUR_AUTH_SOCIAL.GOOGLE_CLIENT_ID) {
    $authProvider.google({
      clientId: ENV.plugins.WALDUR_AUTH_SOCIAL.GOOGLE_CLIENT_ID,
      url: ENV.apiEndpoint + 'api-auth/google/'
    });
  }

  if (ENV.plugins.WALDUR_AUTH_SOCIAL.SMARTIDEE_CLIENT_ID) {
    $authProvider.oauth2({
      name: 'smartid',
      clientId: ENV.plugins.WALDUR_AUTH_SOCIAL.SMARTIDEE_CLIENT_ID,
      url: ENV.apiEndpoint + 'api-auth/smartidee/',
      authorizationEndpoint: 'https://id.smartid.ee/oauth/authorize',
      redirectUri: window.location.origin,
    });
  }
}
