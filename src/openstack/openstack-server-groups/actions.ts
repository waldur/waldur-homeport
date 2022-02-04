import { ActionRegistry } from '@waldur/resource/actions/registry';

import { PullServerGroupAction } from './PullServerGroupAction';

ActionRegistry.register('OpenStack.ServerGroup', [PullServerGroupAction]);
