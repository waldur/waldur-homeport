import { ActionRegistry } from '@waldur/resource/actions/registry';

import { DestroySecurityGroupAction } from './DestroySecurityGroupAction';
import { EditAction } from './EditAction';
import { PullSecurityGroupAction } from './PullSecurityGroupAction';
import { SetRulesAction } from './SetRulesAction';

ActionRegistry.register('OpenStack.SecurityGroup', [
  EditAction,
  SetRulesAction,
  DestroySecurityGroupAction,
  PullSecurityGroupAction,
]);
