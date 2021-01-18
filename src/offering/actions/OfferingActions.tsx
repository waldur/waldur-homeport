import { ChangePlanAction } from '@waldur/marketplace/resources/change-plan/ChangePlanAction';
import { TerminateAction } from '@waldur/marketplace/resources/terminate/TerminateAction';

import { SetBackendIDAction } from './SetBackendIDAction';
import { UpdateAction } from './UpdateAction';

export const OfferingActions = [
  UpdateAction,
  ChangePlanAction,
  TerminateAction,
  SetBackendIDAction,
];
