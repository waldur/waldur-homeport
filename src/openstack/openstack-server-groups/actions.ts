import {
  openstackServerGroupsSetErred,
  openstackServerGroupsSetOk,
} from 'waldur-js-client';

import { DestroyServerGroupAction } from '@/openstack/openstack-server-groups/DestroyServerGroupAction';
import { createSetErredAction } from '@/resource/actions/SetResourceErredAction';
import { createSetOkAction } from '@/resource/actions/SetResourceOkAction';
import { ActionConfiguration } from '@/resource/actions/types';

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
