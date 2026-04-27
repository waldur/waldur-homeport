import {
  openstackFloatingIpsSetErred,
  openstackFloatingIpsSetOk,
} from 'waldur-js-client';

import { createSetErredAction } from '@/resource/actions/SetResourceErredAction';
import { createSetOkAction } from '@/resource/actions/SetResourceOkAction';
import { ActionConfiguration } from '@/resource/actions/types';

import { DestroyFloatingIpAction } from './DestroyFloatingIpAction';
import { PullFloatingIpAction } from './PullFloatingIpAction';

export const OpenStackFloatingIPActions: ActionConfiguration = {
  type: 'OpenStack.FloatingIP',
  actions: [
    PullFloatingIpAction,
    DestroyFloatingIpAction,
    createSetErredAction(openstackFloatingIpsSetErred),
    createSetOkAction(openstackFloatingIpsSetOk),
  ],
};
