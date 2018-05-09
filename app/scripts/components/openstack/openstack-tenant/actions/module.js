import actions from './index';
import openstackTenantChangePackageDialog from './change-package-dialog';
import openstackTenantRequestCustomFlavour from './request-custom-flavour';
import openstackTenantRequestDirectAccess from './request-direct-access';
import openstackTenantChangePackageService from './change-package-service';
import openstackTenantAssignPackageDialog from './assign-package-dialog';

// @ngInject
function actionConfig(ActionConfigurationProvider) {
  ActionConfigurationProvider.register('OpenStack.Tenant', actions);
}

export default module => {
  module.config(actionConfig);
  module.component('openstackTenantChangePackageDialog', openstackTenantChangePackageDialog);
  module.component('openstackTenantRequestCustomFlavour', openstackTenantRequestCustomFlavour);
  module.component('openstackTenantRequestDirectAccess', openstackTenantRequestDirectAccess);
  module.service('openstackTenantChangePackageService', openstackTenantChangePackageService);
  module.component('openstackTenantAssignPackageDialog', openstackTenantAssignPackageDialog);
};
