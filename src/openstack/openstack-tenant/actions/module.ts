import { ActionRegistry } from '@waldur/resource/actions/registry';

import { RequestDirectAccessAction } from './RequestDirectAccessAction';

ActionRegistry.registerQuickActions('OpenStack.Tenant', [
  RequestDirectAccessAction,
]);
