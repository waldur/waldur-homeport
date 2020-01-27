import changeLimitsAction from '@waldur/marketplace/resources/change-limits/ChangeLimitsAction';
import changePlanAction from '@waldur/marketplace/resources/change-plan/ChangePlanAction';
import { createPullAction } from '@waldur/resource/actions/base';

import createFloatingIpAction from './CreateFloatingIpAction';
import createNetworkAction from './CreateNetworkAction';
import createSecurityGroupAction from './CreateSecurityGroupAction';
import editAction from './EditAction';
import pullFloatingIpsAction from './PullFloatingIpsAction';
import pullSecurityGroupsAction from './PullSecurityGroupsAction';
import requestDirectAccessAction from './RequestDirectAccessAction';
import terminateAction from './TerminateAction';

export default [
  editAction,
  requestDirectAccessAction,
  createPullAction,
  changePlanAction,
  changeLimitsAction,
  createNetworkAction,
  createSecurityGroupAction,
  pullSecurityGroupsAction,
  pullFloatingIpsAction,
  createFloatingIpAction,
  terminateAction,
];
