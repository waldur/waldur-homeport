import template from './auth-estonian-id.html';

export const authEstonianId = {
  template,
  controller: class AuthEstonianIdController {
    constructor($sce, ENV) {
      const callbackUrl = 'api-auth/openid/login/?next=/api-auth/login_complete';
      this.openidUrl = $sce.trustAsResourceUrl(ENV.apiEndpoint + callbackUrl);
    }
  }
};
