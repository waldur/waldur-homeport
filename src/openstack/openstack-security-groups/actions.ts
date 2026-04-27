import {
  openstackSecurityGroupsSetErred,
  openstackSecurityGroupsSetOk,
} from 'waldur-js-client';

import { createSetErredAction } from '@/resource/actions/SetResourceErredAction';
import { createSetOkAction } from '@/resource/actions/SetResourceOkAction';
import { ActionConfiguration } from '@/resource/actions/types';

import { DestroySecurityGroupAction } from './DestroySecurityGroupAction';
import { EditAction } from './EditAction';
import { PullSecurityGroupAction } from './PullSecurityGroupAction';
import { SetRulesAction } from './SetRulesAction';
import { UnlinkSecurityGroupAction } from './UnlinkSecurityGroupAction';

export const OpenStackSecurityGroupActions: ActionConfiguration = {
  type: 'OpenStack.SecurityGroup',
  actions: [
    EditAction,
    SetRulesAction,
    DestroySecurityGroupAction,
    PullSecurityGroupAction,
    UnlinkSecurityGroupAction,
    createSetErredAction(openstackSecurityGroupsSetErred),
    createSetOkAction(openstackSecurityGroupsSetOk),
  ],
};
