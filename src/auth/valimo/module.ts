import { connectAngularComponent } from '@waldur/store/connect';

import authValimoDialog from './auth-valimo-dialog';
import AuthValimoService from './auth-valimo-service';
import { AuthValimoTrigger } from './AuthValimoTrigger';

export default module => {
  module.service('AuthValimoService', AuthValimoService);
  module.component('authValimoDialog', authValimoDialog);
  module.component(
    'authValimoTrigger',
    connectAngularComponent(AuthValimoTrigger, ['mode']),
  );
};
