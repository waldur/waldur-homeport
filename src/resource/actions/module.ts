import actionUtilsService from './action-utils-service';
import dialogModule from './dialog/module';

export default module => {
  module.service('actionUtilsService', actionUtilsService);
  dialogModule(module);
};
