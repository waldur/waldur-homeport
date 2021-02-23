import { ChangeLimitsAction } from '@waldur/marketplace/resources/change-limits/ChangeLimitsAction';
import { ChangePlanAction } from '@waldur/marketplace/resources/change-plan/ChangePlanAction';
import { ResourceShowUsageButton } from '@waldur/marketplace/resources/usage/ResourceShowUsageButton';

import { EditAction } from './EditAction';
import { PullTenantAction } from './PullTenantAction';
import { RequestDirectAccessAction } from './RequestDirectAccessAction';
import { TerminateTenantAction } from './TerminateTenantAction';

export default [
  EditAction,
  RequestDirectAccessAction,
  PullTenantAction,
  ChangePlanAction,
  ChangeLimitsAction,
  TerminateTenantAction,
  ResourceShowUsageButton,
];
