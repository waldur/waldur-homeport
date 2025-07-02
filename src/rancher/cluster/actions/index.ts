import { ActionConfiguration } from '@waldur/resource/actions/types';

import { PullClusterAction } from './PullClusterAction';

export const RancherClusterActions: ActionConfiguration = {
  type: 'Rancher.Cluster',
  actions: [PullClusterAction],
};
