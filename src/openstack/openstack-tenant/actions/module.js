import actions from './index';
import openstackTenantRequestDirectAccess from './request-direct-access';

// @ngInject
function actionConfig(ActionConfigurationProvider) {
  ActionConfigurationProvider.register('OpenStack.Tenant', actions);
}

export default module => {
  module.config(actionConfig);
  module.component('openstackTenantRequestDirectAccess', openstackTenantRequestDirectAccess);
};
