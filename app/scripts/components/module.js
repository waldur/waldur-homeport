import {
  protectStates,
  decorateStates,
  urlRouterProvider,
  extendEnv,
  featuresProviderConfig,
  httpInterceptor,
  errorsHandler,
  setEditableOptions,
  closeDialogs
} from './app';
import ncUtilsFlash from './utils';
import loadInspinia from './inspinia';

export default module => {
  module.run(loadInspinia);
  module.run(protectStates);
  module.config(decorateStates);
  module.config(urlRouterProvider);
  module.config(extendEnv);
  module.config(featuresProviderConfig);
  module.factory('httpInterceptor', httpInterceptor);
  module.config(errorsHandler);
  module.run(setEditableOptions);
  module.run(closeDialogs);
  module.factory('ncUtilsFlash', ncUtilsFlash);
  module.factory('ncUtilsFlash', ncUtilsFlash);
};
