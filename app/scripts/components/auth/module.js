import authService from './auth-service';
import { authLogin } from './auth-login';
import poweredBy from './powered-by';
import { authInit } from './auth-init';
import authActivation from './auth-activation';
import authRoutes from './routes';
import initAuthProvider from './auth-config';
import interceptorModule from './interceptor';
import UserSettings from './user-settings';
import storeLastState from './store-state';
import estonianIdModule from './estonianId/module';

export default module => {
  module.service('authService', authService);
  module.component('authLogin', authLogin);
  module.component('poweredBy', poweredBy);
  module.component('authInit', authInit);
  module.directive('authActivation', authActivation);
  module.config(authRoutes);
  module.config(initAuthProvider);
  interceptorModule(module);
  estonianIdModule(module);
  module.service('UserSettings', UserSettings);
  module.run(storeLastState);
};
