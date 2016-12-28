import actionUtilsService from './action-utils-service';
import actionButton from './action-button';
import actionButtonResource from './action-button-resource';
import actionListResource from './action-list-resource';
import actionDialog from './action-dialog';
import ActionConfiguration from './action-configuration';
import {defaultFieldOptions, defaultEditAction} from './constants';

export default module => {
  module.service('actionUtilsService', actionUtilsService);
  module.directive('actionButton', actionButton);
  module.directive('actionButtonResource', actionButtonResource);
  module.directive('actionListResource', actionListResource);
  module.directive('actionDialog', actionDialog);
  module.provider('ActionConfiguration', ActionConfiguration);
  module.constant('DEFAULT_FIELD_OPTIONS', defaultFieldOptions);
  module.constant('DEFAULT_EDIT_ACTION', defaultEditAction);
};
