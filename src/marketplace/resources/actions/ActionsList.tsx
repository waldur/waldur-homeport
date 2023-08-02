import { EditResourceEndDateAction } from '@waldur/marketplace/resources/actions/EditResourceEndDateAction';
import { MoveResourceAction } from '@waldur/marketplace/resources/actions/MoveResourceAction';
import { ChangePlanAction } from '@waldur/marketplace/resources/change-plan/ChangePlanAction';
import { ShowReportAction } from '@waldur/marketplace/resources/report/ShowReportAction';
import { SubmitReportAction } from '@waldur/marketplace/resources/report/SubmitReportAction';
import { SetBackendIdAction } from '@waldur/marketplace/resources/SetBackendIdAction';
import { TerminateAction } from '@waldur/marketplace/resources/terminate/TerminateAction';

import { ChangeLimitsAction } from '../change-limits/ChangeLimitsAction';

import { EditAction } from './EditAction';

export const ActionsList = [
  EditAction,
  MoveResourceAction,
  ShowReportAction,
  SubmitReportAction,
  ChangePlanAction,
  ChangeLimitsAction,
  SetBackendIdAction,
  TerminateAction,
  EditResourceEndDateAction,
];
