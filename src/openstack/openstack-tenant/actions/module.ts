import { ActionRegistry } from '@waldur/resource/actions/registry';

import actions from './index';

ActionRegistry.register('OpenStack.Tenant', actions);
