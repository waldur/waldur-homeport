import authValimoDialog from './auth-valimo-dialog';
import AuthValimoService from './auth-valimo-service';

export default module => {
  module.service('AuthValimoService', AuthValimoService);
  module.component('authValimoDialog', authValimoDialog);
};
