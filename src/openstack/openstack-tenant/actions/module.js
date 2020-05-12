import { ActionConfigurationRegistry } from '@waldur/resource/actions/action-configuration';

import openstackTenantRequestDirectAccess from './request-direct-access';

import actions from './index';

export default module => {
  ActionConfigurationRegistry.register('OpenStack.Tenant', actions);
  module.component(
    'openstackTenantRequestDirectAccess',
    openstackTenantRequestDirectAccess,
  );
};
