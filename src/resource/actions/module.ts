import ActionResourceLoader from './action-resource-loader';
import actionUtilsService from './action-utils-service';
import dialogModule from './dialog/module';

export default module => {
  module.service('ActionResourceLoader', ActionResourceLoader);
  module.service('actionUtilsService', actionUtilsService);
  dialogModule(module);
};
