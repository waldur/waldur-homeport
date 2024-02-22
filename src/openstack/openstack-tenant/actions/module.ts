import { ActionRegistry } from '@waldur/resource/actions/registry';

import { RequestDirectAccessAction } from './RequestDirectAccessAction';

import actions from './index';

ActionRegistry.register('OpenStack.Tenant', actions);
ActionRegistry.registerQuickActions('OpenStack.Tenant', [
  RequestDirectAccessAction,
]);
