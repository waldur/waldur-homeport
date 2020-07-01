import initAuthProvider from './auth-config';
import { AuthService } from './auth-service';
import interceptorModule from './interceptor';
import storeLastState from './store-state';
import './events';

export default (module) => {
  module.service('authService', AuthService);
  module.config(initAuthProvider);
  interceptorModule(module);
  module.run(storeLastState);
};
