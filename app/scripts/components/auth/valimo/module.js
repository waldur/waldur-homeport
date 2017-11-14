import AuthValimoService from './auth-valimo-service';
import authValimoDialog from './auth-valimo-dialog';
import authValimoTrigger from './auth-valimo-trigger';

export default module => {
  module.service('AuthValimoService', AuthValimoService);
  module.component('authValimoDialog', authValimoDialog);
  module.component('authValimoTrigger', authValimoTrigger);
};
