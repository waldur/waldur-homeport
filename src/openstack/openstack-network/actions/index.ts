import { ActionRegistry } from '@waldur/resource/actions/registry';

import { CreateSubnetAction } from './CreateSubnetAction';
import { DestroyNetworkAction } from './DestroyNetworkAction';
import { PullNetworkAction } from './PullNetworkAction';
import { SetMtuAction } from './SetMtuAction';

ActionRegistry.register('OpenStack.Network', [
  PullNetworkAction,
  CreateSubnetAction,
  SetMtuAction,
  DestroyNetworkAction,
]);
