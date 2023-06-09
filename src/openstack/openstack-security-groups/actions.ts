import { ActionRegistry } from '@waldur/resource/actions/registry';

import { DestroySecurityGroupAction } from './DestroySecurityGroupAction';
import { PullSecurityGroupAction } from './PullSecurityGroupAction';
import { SetRulesAction } from './SetRulesAction';

ActionRegistry.register('OpenStack.SecurityGroup', [
  SetRulesAction,
  DestroySecurityGroupAction,
  PullSecurityGroupAction,
]);
