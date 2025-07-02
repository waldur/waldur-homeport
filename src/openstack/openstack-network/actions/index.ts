import { ActionConfiguration } from '@waldur/resource/actions/types';

import { CreateSubnetAction } from './CreateSubnetAction';
import { DestroyNetworkAction } from './DestroyNetworkAction';
import { EditNetworkAction } from './EditNetworkAction';
import { PullNetworkAction } from './PullNetworkAction';
import { SetMtuAction } from './SetMtuAction';
import { ShareNetworkAction } from './ShareNetworkAction';

export const OpenStackNetworkActions: ActionConfiguration = {
  type: 'OpenStack.Network',
  actions: [
    ShareNetworkAction,
    EditNetworkAction,
    PullNetworkAction,
    CreateSubnetAction,
    SetMtuAction,
    DestroyNetworkAction,
  ],
};
