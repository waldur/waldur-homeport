import HttpUtils from './http-utils';
import ActionResourceLoader from './action-resource-loader';
import actionUtilsService from './action-utils-service';
import actionButtonResource from './action-button-resource';
import ActionConfiguration from './action-configuration';
import {defaultFieldOptions, defaultEditAction} from './constants';
import dialogModule from './dialog/module';
import createVmButton from './create-vm-button';

export default module => {
  module.service('HttpUtils', HttpUtils);
  module.service('ActionResourceLoader', ActionResourceLoader);
  module.service('actionUtilsService', actionUtilsService);
  module.component('createVmButton', createVmButton);
  module.component('actionButtonResource', actionButtonResource);
  module.provider('ActionConfiguration', ActionConfiguration);
  module.constant('DEFAULT_FIELD_OPTIONS', defaultFieldOptions);
  module.constant('DEFAULT_EDIT_ACTION', defaultEditAction);
  dialogModule(module);
};
