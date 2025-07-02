import { ActionConfiguration } from '@waldur/resource/actions/types';

import { OPENSTACK_PORT_TYPE } from '../constants';
import { UpdateSecurityGroupsAction } from '../openstack-instance/actions/update-security-groups/UpdateSecurityGroupsAction';

import { ActivatePortAction } from './actions/ActivatePortAction';
import { DestroyPortAction } from './actions/DestroyPortAction';
import { PullPortAction } from './actions/PullPortAction';
import { TogglePortSecurityAction } from './actions/TogglePortSecurityAction';
import { UnlinkPortAction } from './actions/UnlinkPortAction';
import { UpdatePortAction } from './actions/UpdatePortAction';

export const OpenStackPortActions: ActionConfiguration = {
  type: OPENSTACK_PORT_TYPE,
  actions: [
    UpdatePortAction,
    ActivatePortAction,
    TogglePortSecurityAction,
    UpdateSecurityGroupsAction,
    PullPortAction,
    UnlinkPortAction,
    DestroyPortAction,
  ],
};
