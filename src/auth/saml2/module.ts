import { connectAngularComponent } from '@waldur/store/connect';

import { AuthSaml2Button } from './AuthSaml2Button';
import { AuthSaml2Dialog } from './AuthSaml2Dialog';
import { AuthSaml2Trigger } from './AuthSaml2Trigger';

export default module => {
  module.component('authSaml2Dialog', connectAngularComponent(AuthSaml2Dialog));
  module.component(
    'authSaml2Trigger',
    connectAngularComponent(AuthSaml2Trigger, ['mode']),
  );
  module.component(
    'authSaml2',
    connectAngularComponent(AuthSaml2Button, ['mode']),
  );
};
