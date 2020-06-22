import initAuthProvider from './auth-config';
import { AuthService } from './auth-service';
import interceptorModule from './interceptor';
import storeLastState from './store-state';
import valimoModule from './valimo/module';
import './events';

export default (module) => {
  module.service('authService', AuthService);
  module.config(initAuthProvider);
  interceptorModule(module);
  valimoModule(module);
  module.run(storeLastState);
};
