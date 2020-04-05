import { connectAngularComponent } from '@waldur/store/connect';

import { CookiesConsent } from './CookiesConsent';

export default module => {
  module.component('cookiesConsent', connectAngularComponent(CookiesConsent));
};
