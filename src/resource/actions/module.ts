import ActionResourceLoader from './action-resource-loader';
import actionUtilsService from './action-utils-service';
import dialogModule from './dialog/module';
import HttpUtils from './http-utils';

export default module => {
  module.service('HttpUtils', HttpUtils);
  module.service('ActionResourceLoader', ActionResourceLoader);
  module.service('actionUtilsService', actionUtilsService);
  dialogModule(module);
};
