import actionUtilsService from './action-utils-service';
import actionButton from './action-button';
import actionList from './action-list';
import actionButtonResource from './action-button-resource';
import actionListResource from './action-list-resource';
import actionDialog from './action-dialog';
import ActionConfiguration from './action-configuration';

export default module => {
  module.service('actionUtilsService', actionUtilsService);
  module.directive('actionButton', actionButton);
  module.directive('actionList', actionList);
  module.directive('actionButtonResource', actionButtonResource);
  module.directive('actionListResource', actionListResource);
  module.directive('actionDialog', actionDialog);
  module.provider('ActionConfiguration', ActionConfiguration);
}
