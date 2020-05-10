import { connectAngularComponent } from '@waldur/store/connect';

import { AuthSaml2Dialog } from './AuthSaml2Dialog';

export default module => {
  module.component('authSaml2Dialog', connectAngularComponent(AuthSaml2Dialog));
};
