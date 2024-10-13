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
import { CreateRobotAccountAction } from '@waldur/marketplace/robot-accounts/CreateRobotAccountAction';
import { SetErredActionItem } from '@waldur/resource/actions/SetErredActionItem';
import { UnlinkActionItem } from '@waldur/resource/actions/UnlinkActionItem';

import { ChangeLimitsAction } from '../change-limits/ChangeLimitsAction';
import { ReportUsageAction } from '../list/ReportUsageAction';
import { ShowUsageAction } from '../list/ShowUsageAction';

import { EditAction } from './EditAction';
import { EditResourceEndDateByProviderAction } from './EditResourceEndDateByProviderAction';
import { EditResourceEndDateByStaffAction } from './EditResourceEndDateByStaffAction';

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
  SetErredActionItem,
  EditResourceEndDateAction,
  SyncResourceAction,
  CreateLexisLinkAction,
];

export const CustomerResourceActions = [
  EditAction,
  ShowReportAction,
  ChangePlanAction,
  ChangeLimitsAction,
  EditResourceEndDateAction,
  SyncResourceAction,
  TerminateAction,
];

export const ProviderActionsList = [
  ShowUsageAction,
  ReportUsageAction,
  SetBackendIdAction,
  SubmitReportAction,
  CreateLexisLinkAction,
  CreateRobotAccountAction,
  EditResourceEndDateByProviderAction,
];

export const StaffActions = [
  UnlinkActionItem,
  SetErredActionItem,
  MoveResourceAction,
  SetSlugAction,
  EditResourceEndDateByStaffAction,
];
