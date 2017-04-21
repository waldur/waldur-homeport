import authLoginComplete from './auth-login-complete';
import authLoginFailed from './auth-login-failed';
import authLogoutFailed from './auth-logout-failed';

export default module => {
  module.component('authLoginComplete', authLoginComplete);
  module.component('authLoginFailed', authLoginFailed);
  module.component('authLogoutFailed', authLogoutFailed);
};
