import { ActionConfigurationRegistry } from '@waldur/resource/actions/action-configuration';
import { createPullAction } from '@waldur/resource/actions/base';

import CreateSubnetAction from './CreateSubnetAction';
import DestroyAction from './DestroyAction';
import EditAction from './EditAction';
import SetMtuAction from './SetMtuAction';

ActionConfigurationRegistry.register('OpenStack.Network', [
  EditAction,
  createPullAction,
  CreateSubnetAction,
  SetMtuAction,
  DestroyAction,
]);
