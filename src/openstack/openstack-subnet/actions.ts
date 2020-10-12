import { ActionConfigurationRegistry } from '@waldur/resource/actions/action-configuration';
import { createPullAction } from '@waldur/resource/actions/base';

import DestroyAction from './DestroyAction';
import EditAction from './EditAction';

ActionConfigurationRegistry.register('OpenStack.SubNet', [
  EditAction,
  createPullAction,
  DestroyAction,
]);
