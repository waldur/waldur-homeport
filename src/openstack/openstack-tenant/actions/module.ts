import { ActionConfigurationRegistry } from '@waldur/resource/actions/action-configuration';

import actions from './index';

ActionConfigurationRegistry.register('OpenStack.Tenant', actions);
