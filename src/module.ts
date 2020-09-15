import {
  protectStates,
  urlRouterProvider,
  extendEnv,
  featuresProviderConfig,
} from './app';
import loadInspinia from './inspinia';

export default (module) => {
  module.run(loadInspinia);
  module.run(protectStates);
  module.config(urlRouterProvider);
  module.config(extendEnv);
  module.config(featuresProviderConfig);
};
