import template from './auth-estonian-id.html';

const authEstonianId = {
  template,
  bindings: {
    mode: '<'
  },
  controller: class AuthEstonianIdController {
    // @ngInject
    constructor($sce, ENV) {
      const callbackUrl = 'api-auth/openid/login/?next=/api-auth/login_complete';
      this.openidUrl = $sce.trustAsResourceUrl(ENV.apiEndpoint + callbackUrl);
    }
  }
};

export default authEstonianId;
