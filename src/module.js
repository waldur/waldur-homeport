import {
  protectStates,
  urlRouterProvider,
  extendEnv,
  featuresProviderConfig,
} from './app';
import loadInspinia from './inspinia';
import { uibDropdownFix } from './shims/uibDropdownFix';
import { ncUtilsFlash } from './utils';

export default module => {
  module.run(loadInspinia);
  module.run(protectStates);
  module.config(urlRouterProvider);
  module.config(extendEnv);
  module.config(featuresProviderConfig);
  module.factory('ncUtilsFlash', ncUtilsFlash);
  module.directive('uibDropdownFix', uibDropdownFix);
};
