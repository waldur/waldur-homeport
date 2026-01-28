import { EditResourceEndDateAction } from '@waldur/marketplace/resources/actions/EditResourceEndDateAction';
import { MoveResourceAction } from '@waldur/marketplace/resources/actions/MoveResourceAction';
import { SyncResourceAction } from '@waldur/marketplace/resources/actions/SyncResourceAction';
import { ChangePlanAction } from '@waldur/marketplace/resources/change-plan/ChangePlanAction';
import { CreateLexisLinkAction } from '@waldur/marketplace/resources/lexis/CreateLexisLinkAction';
import { SubmitReportAction } from '@waldur/marketplace/resources/report/SubmitReportAction';
import { SetBackendIdAction } from '@waldur/marketplace/resources/SetBackendIdAction';
import { SetSlugAction } from '@waldur/marketplace/resources/SetSlugAction';
import { TerminateAction } from '@waldur/marketplace/resources/terminate/TerminateAction';
import { CreateRobotAccountAction } from '@waldur/marketplace/robot-accounts/CreateRobotAccountAction';
import { SetErredActionItem } from '@waldur/resource/actions/SetErredActionItem';
import { UnlinkActionItem } from '@waldur/resource/actions/UnlinkActionItem';
import { PullSiteAgentResourceAction } from '@waldur/site-agent/PullSiteAgentResourceAction';

import { ChangeLimitsAction } from '../change-limits/ChangeLimitsAction';
import { ResourceDetailsAction } from '../details/popup/ResourceDetailsAction';
import { ReportUsageAction } from '../list/ReportUsageAction';
import { ReportUserUsageAction } from '../list/ReportUserUsageAction';
import { ShowUsageAction } from '../list/ShowUsageAction';
import { ReallocateLimitsAction } from '../reallocate-limits/ReallocateLimitsAction';
import { RenewAllocationActionAction } from '../renew-allocation/RenewAllocationAction';

import { EditAction } from './EditAction';
import { EditResourceEndDateByProviderAction } from './EditResourceEndDateByProviderAction';
import { EditResourceEndDateByStaffAction } from './EditResourceEndDateByStaffAction';
import { PullOrderAction } from './PullOrderAction';
import { PullResourceAction } from './PullResourceAction';
import { PullRobotAccounts } from './PullRobotAccounts';
import { SetDownscaledAction } from './SetDownscaledAction';
import { SetPausedAction } from './SetPausedAction';
import { VersionHistoryAction } from './VersionHistoryAction';

export const ActionsList = [
  EditAction,
  MoveResourceAction,
  SubmitReportAction,
  ChangePlanAction,
  ChangeLimitsAction,
  RenewAllocationActionAction,
  ReallocateLimitsAction,
  SetBackendIdAction,
  SetSlugAction,
  TerminateAction,
  UnlinkActionItem,
  SetErredActionItem,
  EditResourceEndDateAction,
  SyncResourceAction,
  PullSiteAgentResourceAction,
  CreateLexisLinkAction,
];

export const CustomerResourceActions = [
  EditAction,
  ChangePlanAction,
  ChangeLimitsAction,
  RenewAllocationActionAction,
  ReallocateLimitsAction,
  EditResourceEndDateAction,
  SyncResourceAction,
  PullSiteAgentResourceAction,
  TerminateAction,
];

export const ProviderActionsList = [
  ShowUsageAction,
  ReportUsageAction,
  ReportUserUsageAction,
  SetBackendIdAction,
  SubmitReportAction,
  CreateLexisLinkAction,
  CreateRobotAccountAction,
  SetErredActionItem,
  EditResourceEndDateByProviderAction,
  ResourceDetailsAction,
  PullSiteAgentResourceAction,
];

export const StaffActions = [
  UnlinkActionItem,
  MoveResourceAction,
  SetSlugAction,
  EditResourceEndDateByStaffAction,
  SetDownscaledAction,
  SetPausedAction,
  // Resource sync actions
  PullResourceAction,
  PullOrderAction,
  PullRobotAccounts,
  // Version history
  VersionHistoryAction,
];
