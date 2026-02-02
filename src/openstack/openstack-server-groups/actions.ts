import {
  openstackServerGroupsSetErred,
  openstackServerGroupsSetOk,
} from 'waldur-js-client';

import { DestroyServerGroupAction } from '@waldur/openstack/openstack-server-groups/DestroyServerGroupAction';
import { createSetErredAction } from '@waldur/resource/actions/SetResourceErredAction';
import { createSetOkAction } from '@waldur/resource/actions/SetResourceOkAction';
import { ActionConfiguration } from '@waldur/resource/actions/types';

import { PullServerGroupAction } from './PullServerGroupAction';

export const OpenStackServerGroupActions: ActionConfiguration = {
  type: 'OpenStack.ServerGroup',
  actions: [
    PullServerGroupAction,
    DestroyServerGroupAction,
    createSetErredAction(openstackServerGroupsSetErred),
    createSetOkAction(openstackServerGroupsSetOk),
  ],
};
