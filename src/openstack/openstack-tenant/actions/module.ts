import { ActionConfigurationRegistry } from '@waldur/resource/actions/action-configuration';

import actions from './index';

export default () => {
  ActionConfigurationRegistry.register('OpenStack.Tenant', actions);
};
