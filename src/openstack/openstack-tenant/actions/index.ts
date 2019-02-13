import changePlanAction from '@waldur/marketplace/resources/ChangePlanAction';
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
  requestCustomFlavorAction,
  createNetworkAction,
  createSecurityGroupAction,
  pullSecurityGroupsAction,
  pullFloatingIpsAction,
  createFloatingIpAction,
  destroyAction,
];
