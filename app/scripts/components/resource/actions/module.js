import HttpUtils from './http-utils';
import actionUtilsService from './action-utils-service';
import actionButton from './action-button';
import actionButtonResource from './action-button-resource';
import ActionConfiguration from './action-configuration';
import {defaultFieldOptions, defaultEditAction} from './constants';
import dialogModule from './dialog/module';

export default module => {
  module.service('HttpUtils', HttpUtils);
  module.service('actionUtilsService', actionUtilsService);
  module.directive('actionButton', actionButton);
  module.directive('actionButtonResource', actionButtonResource);
  module.provider('ActionConfiguration', ActionConfiguration);
  module.constant('DEFAULT_FIELD_OPTIONS', defaultFieldOptions);
  module.constant('DEFAULT_EDIT_ACTION', defaultEditAction);
  dialogModule(module);
};
