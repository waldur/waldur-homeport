import { ActionConfiguration } from '@/resource/actions/types';

import { PullAllocationAction } from './actions/PullAllocationAction';
import { SetLimitsAction } from './actions/SetLimitsAction';
import { OPENPORTAL_PLUGIN } from './constants';

export const OpenPortalAllocationActions: ActionConfiguration = {
  type: OPENPORTAL_PLUGIN,
  actions: [PullAllocationAction, SetLimitsAction],
};
