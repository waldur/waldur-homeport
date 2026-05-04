import { ActionConfiguration } from '@/resource/actions/types';

import { AttachFloatingIpAction } from './actions/AttachFloatingIpAction';
import { CreateListenerAction } from './actions/CreateListenerAction';
import { CreatePoolAction } from './actions/CreatePoolAction';
import { DetachFloatingIpAction } from './actions/DetachFloatingIpAction';
import { EditLoadBalancerAction } from './actions/EditLoadBalancerAction';
import { PullLoadBalancerAction } from './actions/PullLoadBalancerAction';
import { SetSecurityGroupsAction } from './actions/SetSecurityGroupsAction';
import { DestroyLoadBalancerAction } from './DestroyLoadBalancerAction';

export const OpenStackLoadBalancerActions: ActionConfiguration = {
  type: 'OpenStack.LoadBalancer',
  actions: [
    CreateListenerAction,
    CreatePoolAction,
    AttachFloatingIpAction,
    DetachFloatingIpAction,
    SetSecurityGroupsAction,
    PullLoadBalancerAction,
    EditLoadBalancerAction,
    DestroyLoadBalancerAction,
  ],
};
