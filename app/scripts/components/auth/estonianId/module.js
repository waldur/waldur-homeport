import authEstonianId from './auth-estonian-id';
import authLoginComplete from './auth-login-complete';
import authLoginFailed from './auth-login-failed';
import estonianIdLogout from './auth-estonian-id-logout';

export default module => {
  module.component('authEstonianId', authEstonianId);
  module.component('authLoginComplete', authLoginComplete);
  module.component('authLoginFailed', authLoginFailed);
  module.run(estonianIdLogout);
};
