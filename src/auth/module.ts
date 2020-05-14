import initAuthProvider from './auth-config';
import { authInit } from './auth-init';
import { AuthService } from './auth-service';
import callbacksModule from './callbacks/module';
import interceptorModule from './interceptor';
import authRoutes from './routes';
import saml2Module from './saml2/module';
import storeLastState from './store-state';
import UserSettings from './user-settings';
import valimoModule from './valimo/module';
import './events';

export default module => {
  module.service('authService', AuthService);
  module.component('authInit', authInit);
  module.config(authRoutes);
  module.config(initAuthProvider);
  interceptorModule(module);
  callbacksModule(module);
  saml2Module(module);
  valimoModule(module);
  module.service('UserSettings', UserSettings);
  module.run(storeLastState);
};
