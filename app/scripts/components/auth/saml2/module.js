import Saml2Service from './saml2-service';
import authSaml2Dialog from './auth-saml2-dialog';
import authSaml2Trigger from './auth-saml2-trigger';
import authSaml2 from './auth-saml2';

export default module => {
  module.service('Saml2Service', Saml2Service);
  module.component('authSaml2Dialog', authSaml2Dialog);
  module.component('authSaml2Trigger', authSaml2Trigger);
  module.component('authSaml2', authSaml2);
};
