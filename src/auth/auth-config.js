import { ngInjector } from '@waldur/core/services';

// @ngInject
export default function initAuthProvider(ENV, $authProvider) {
  $authProvider.httpInterceptor = false;
  $authProvider.storageType = ENV.authStorage;

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
      url: ENV.apiEndpoint + 'api-auth/google/',
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

  if (ENV.plugins.WALDUR_AUTH_SOCIAL.TARA_CLIENT_ID) {
    $authProvider.oauth2({
      name: 'tara',
      clientId: ENV.plugins.WALDUR_AUTH_SOCIAL.TARA_CLIENT_ID,
      url: ENV.apiEndpoint + 'api-auth/tara/',
      authorizationEndpoint: ENV.plugins.WALDUR_AUTH_SOCIAL.TARA_SANDBOX
        ? 'https://tara-test.ria.ee/oidc/authorize'
        : 'https://tara.ria.ee/oidc/authorize',
      redirectUri: window.location.origin + '/login_completed/',
      scope: ['openid'],
      scopePrefix: '',
      scopeDelimiter: ' ',
      ui_locales: () => ngInjector.get('LanguageUtilsService').current.code,
      state: () =>
        encodeURIComponent(
          Math.random()
            .toString(36)
            .substr(2),
        ),
      requiredUrlParams: ['scope', 'state', 'ui_locales'],
    });
  }
}
