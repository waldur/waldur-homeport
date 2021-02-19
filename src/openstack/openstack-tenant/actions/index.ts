import { ChangeLimitsAction } from '@waldur/marketplace/resources/change-limits/ChangeLimitsAction';
import { ChangePlanAction } from '@waldur/marketplace/resources/change-plan/ChangePlanAction';

import { EditAction } from './EditAction';
import { PullTenantAction } from './PullTenantAction';
import { RequestDirectAccessAction } from './RequestDirectAccessAction';
import { TerminateTenantAction } from './TerminateTenantAction';

// example of actions
export default [
  EditAction,
  RequestDirectAccessAction,
  PullTenantAction,
  ChangePlanAction,
  ChangeLimitsAction,
  TerminateTenantAction,
];
