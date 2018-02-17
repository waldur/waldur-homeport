import authCallbackRoutes from './routes';
import authLoginCompleted from './auth-login-completed';
import authLoginFailed from './auth-login-failed';
import authLogoutCompleted from './auth-logout-completed';
import authLogoutFailed from './auth-logout-failed';

export default module => {
  module.config(authCallbackRoutes);
  module.component('authLoginCompleted', authLoginCompleted);
  module.component('authLoginFailed', authLoginFailed);
  module.component('authLogoutCompleted', authLogoutCompleted);
  module.component('authLogoutFailed', authLogoutFailed);
};
