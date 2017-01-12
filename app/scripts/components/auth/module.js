import authService from './auth-service';
import authLogin from './auth-login';
import authLoginComplete from './auth-login-complete';
import authInit from './auth-init';
import authActivation from './auth-activation';
import authRoutes from './routes';
import initAuthProvider from './auth-config';
import interceptorModule from './interceptor';
import storeStateModule from './store-state';

export default module => {
  module.service('authService', authService);
  module.directive('authLogin', authLogin);
  module.directive('authLoginComplete', authLoginComplete);
  module.directive('authInit', authInit);
  module.directive('authActivation', authActivation);
  module.config(authRoutes);
  module.config(initAuthProvider);
  interceptorModule(module);
  storeStateModule(module);
};
