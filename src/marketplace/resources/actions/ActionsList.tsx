import { EditResourceEndDateAction } from '@/marketplace/resources/actions/EditResourceEndDateAction';
import { MoveResourceAction } from '@/marketplace/resources/actions/MoveResourceAction';
import { SyncResourceAction } from '@/marketplace/resources/actions/SyncResourceAction';
import { ChangePlanAction } from '@/marketplace/resources/change-plan/ChangePlanAction';
import { EditResourceMetadataAction } from '@/marketplace/resources/EditResourceMetadataAction';
import { CreateLexisLinkAction } from '@/marketplace/resources/lexis/CreateLexisLinkAction';
import { SubmitReportAction } from '@/marketplace/resources/report/SubmitReportAction';
import { SetBackendIdAction } from '@/marketplace/resources/SetBackendIdAction';
import { SetSlugAction } from '@/marketplace/resources/SetSlugAction';
import { TerminateAction } from '@/marketplace/resources/terminate/TerminateAction';
import { CreateRobotAccountAction } from '@/marketplace/robot-accounts/CreateRobotAccountAction';
import { SetErredActionItem } from '@/resource/actions/SetErredActionItem';
import { UnlinkActionItem } from '@/resource/actions/UnlinkActionItem';

import { ChangeLimitsAction } from '../change-limits/ChangeLimitsAction';
import { ResourceDetailsAction } from '../details/popup/ResourceDetailsAction';
import { ReportUsageAction } from '../list/ReportUsageAction';
import { ReportUserUsageAction } from '../list/ReportUserUsageAction';
import { ShowUsageAction } from '../list/ShowUsageAction';
import { ReallocateLimitsAction } from '../reallocate-limits/ReallocateLimitsAction';
import { RenewAllocationActionAction } from '../renew-allocation/RenewAllocationAction';
import { RequestEndDateChangeAction } from '../request-end-date-change/RequestEndDateChangeAction';
import { RequestLimitsChangeAction } from '../request-limits-change/RequestLimitsChangeAction';

import { AdjustResourceDatesAction } from './AdjustResourceDatesAction';
import { EditAction } from './EditAction';
import { EditResourceEndDateByProviderAction } from './EditResourceEndDateByProviderAction';
import { PullMarketplaceResourceAction } from './PullMarketplaceResourceAction';
import { PullOrderAction } from './PullOrderAction';
import { PullResourceAction } from './PullResourceAction';
import { PullRobotAccounts } from './PullRobotAccounts';
import { RestoreResourceAction } from './RestoreResourceAction';
import { SetDownscaledAction } from './SetDownscaledAction';
import { SetPausedAction } from './SetPausedAction';
import { SyncResourceTeamAction } from './SyncResourceTeamAction';
import { VersionHistoryAction } from './VersionHistoryAction';

export const ActionsList = [
  EditAction,
  MoveResourceAction,
  SubmitReportAction,
  ChangePlanAction,
  ChangeLimitsAction,
  RequestLimitsChangeAction,
  RequestEndDateChangeAction,
  RenewAllocationActionAction,
  ReallocateLimitsAction,
  SetBackendIdAction,
  SetSlugAction,
  TerminateAction,
  RestoreResourceAction,
  UnlinkActionItem,
  SetErredActionItem,
  EditResourceEndDateAction,
  SyncResourceAction,
  PullMarketplaceResourceAction,
  CreateLexisLinkAction,
];

export const CustomerResourceActions = [
  EditAction,
  ChangePlanAction,
  ChangeLimitsAction,
  RequestLimitsChangeAction,
  RequestEndDateChangeAction,
  RenewAllocationActionAction,
  ReallocateLimitsAction,
  EditResourceEndDateAction,
  SyncResourceAction,
  PullMarketplaceResourceAction,
  TerminateAction,
];

export const ProviderActionsList = [
  ShowUsageAction,
  ReportUsageAction,
  ReportUserUsageAction,
  SetBackendIdAction,
  EditResourceMetadataAction,
  SubmitReportAction,
  CreateLexisLinkAction,
  CreateRobotAccountAction,
  SetErredActionItem,
  RestoreResourceAction,
  EditResourceEndDateByProviderAction,
  ResourceDetailsAction,
  PullMarketplaceResourceAction,
];

export const StaffActions = [
  UnlinkActionItem,
  MoveResourceAction,
  SetSlugAction,
  SetDownscaledAction,
  SetPausedAction,
  AdjustResourceDatesAction,
  // Resource sync actions
  PullResourceAction,
  PullOrderAction,
  PullRobotAccounts,
  SyncResourceTeamAction,
  // Version history
  VersionHistoryAction,
];
