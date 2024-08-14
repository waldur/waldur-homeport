import { EditResourceEndDateAction } from '@waldur/marketplace/resources/actions/EditResourceEndDateAction';
import { MoveResourceAction } from '@waldur/marketplace/resources/actions/MoveResourceAction';
import { SyncResourceAction } from '@waldur/marketplace/resources/actions/SyncResourceAction';
import { ChangePlanAction } from '@waldur/marketplace/resources/change-plan/ChangePlanAction';
import { CreateLexisLinkAction } from '@waldur/marketplace/resources/lexis/CreateLexisLinkAction';
import { ShowReportAction } from '@waldur/marketplace/resources/report/ShowReportAction';
import { SubmitReportAction } from '@waldur/marketplace/resources/report/SubmitReportAction';
import { SetBackendIdAction } from '@waldur/marketplace/resources/SetBackendIdAction';
import { SetSlugAction } from '@waldur/marketplace/resources/SetSlugAction';
import { TerminateAction } from '@waldur/marketplace/resources/terminate/TerminateAction';
import { UnlinkActionItem } from '@waldur/resource/actions/UnlinkActionItem';

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
  SetSlugAction,
  TerminateAction,
  UnlinkActionItem,
  EditResourceEndDateAction,
  SyncResourceAction,
  CreateLexisLinkAction,
];
