import authService from './auth-service';
import { authLogin } from './auth-login';
import { authEstonianId } from './auth-estonian-id';
import authLoginComplete from './auth-login-complete';
import { authInit } from './auth-init';
import authActivation from './auth-activation';
import authRoutes from './routes';
import initAuthProvider from './auth-config';
import interceptorModule from './interceptor';
import UserSettings from './user-settings';
import storeLastState from './store-state';

export default module => {
  module.service('authService', authService);
  module.component('authLogin', authLogin);
  module.component('authEstonianId', authEstonianId);
  module.directive('authLoginComplete', authLoginComplete);
  module.component('authInit', authInit);
  module.directive('authActivation', authActivation);
  module.config(authRoutes);
  module.config(initAuthProvider);
  interceptorModule(module);
  module.service('UserSettings', UserSettings);
  module.run(storeLastState);
};
