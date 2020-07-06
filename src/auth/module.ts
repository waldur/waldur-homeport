import initAuthProvider from './auth-config';
import interceptorModule from './interceptor';
import storeLastState from './store-state';
import './events';

export default (module) => {
  module.config(initAuthProvider);
  interceptorModule(module);
  module.run(storeLastState);
};
