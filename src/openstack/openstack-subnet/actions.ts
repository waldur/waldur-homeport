import { ActionRegistry } from '@waldur/resource/actions/registry';

import { ConnectSubnetAction } from './ConnectSubnetAction';
import { DestroySubnetAction } from './DestroySubnetAction';
import { DisconnectSubnetAction } from './DisconnectSubnetAction';
import { EditSubnetAction } from './EditSubnetAction';
import { PullSubnetAction } from './PullSubnetAction';

ActionRegistry.register('OpenStack.SubNet', [
  EditSubnetAction,
  ConnectSubnetAction,
  DisconnectSubnetAction,
  PullSubnetAction,
  DestroySubnetAction,
]);
