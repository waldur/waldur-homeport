import { ActionRegistry } from '@waldur/resource/actions/registry';

import { DestroySubnetAction } from './DestroySubnetAction';
import { EditSubnetAction } from './EditSubnetAction';
import { PullSubnetAction } from './PullSubnetAction';

ActionRegistry.register('OpenStack.SubNet', [
  EditSubnetAction,
  PullSubnetAction,
  DestroySubnetAction,
]);
