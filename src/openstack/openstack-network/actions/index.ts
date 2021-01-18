import { ActionRegistry } from '@waldur/resource/actions/registry';

import { CreateSubnetAction } from './CreateSubnetAction';
import { DestroyNetworkAction } from './DestroyNetworkAction';
import { EditNetworkAction } from './EditNetworkAction';
import { PullNetworkAction } from './PullNetworkAction';
import { SetMtuAction } from './SetMtuAction';

ActionRegistry.register('OpenStack.Network', [
  EditNetworkAction,
  PullNetworkAction,
  CreateSubnetAction,
  SetMtuAction,
  DestroyNetworkAction,
]);
