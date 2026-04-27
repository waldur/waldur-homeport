import { EditResourceEndDateAction } from '@/marketplace/resources/actions/EditResourceEndDateAction';
import { MoveResourceAction } from '@/marketplace/resources/actions/MoveResourceAction';
import { SyncResourceAction } from '@/marketplace/resources/actions/SyncResourceAction';
import { ChangePlanAction } from '@/marketplace/resources/change-plan/ChangePlanAction';
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

import { EditAction } from './EditAction';
import { EditResourceEndDateByProviderAction } from './EditResourceEndDateByProviderAction';
import { PullMarketplaceResourceAction } from './PullMarketplaceResourceAction';
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
  PullMarketplaceResourceAction,
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
  PullMarketplaceResourceAction,
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
  PullMarketplaceResourceAction,
];

export const StaffActions = [
  UnlinkActionItem,
  MoveResourceAction,
  SetSlugAction,
  SetDownscaledAction,
  SetPausedAction,
  // Resource sync actions
  PullResourceAction,
  PullOrderAction,
  PullRobotAccounts,
  // Version history
  VersionHistoryAction,
];
