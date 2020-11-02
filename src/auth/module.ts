import interceptorModule from './interceptor';
import storeLastState from './store-state';
import './events';

export default (module) => {
  interceptorModule(module);
  module.run(storeLastState);
};
