import changeLimitsAction from '@waldur/marketplace/resources/change-limits/ChangeLimitsAction';
import changePlanAction from '@waldur/marketplace/resources/change-plan/ChangePlanAction';
import terminateAction from '@waldur/marketplace/resources/terminate/TerminateAction';
import { createPullAction } from '@waldur/resource/actions/base';

import assignPackageAction from './AssignPackageAction';
import changePackageAction from './ChangePackageAction';
import createFloatingIpAction from './CreateFloatingIpAction';
import createNetworkAction from './CreateNetworkAction';
import createSecurityGroupAction from './CreateSecurityGroupAction';
import destroyAction from './DestroyAction';
import editAction from './EditAction';
import pullFloatingIpsAction from './PullFloatingIpsAction';
import pullSecurityGroupsAction from './PullSecurityGroupsAction';
import requestCustomFlavorAction from './RequestCustomFlavorAction';
import requestDirectAccessAction from './RequestDirectAccessAction';

export default [
  editAction,
  requestDirectAccessAction,
  createPullAction,
  assignPackageAction,
  changePackageAction,
  changePlanAction,
  changeLimitsAction,
  requestCustomFlavorAction,
  createNetworkAction,
  createSecurityGroupAction,
  pullSecurityGroupsAction,
  pullFloatingIpsAction,
  createFloatingIpAction,
  terminateAction,
  destroyAction,
];
