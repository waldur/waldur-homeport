import {
  BellSlashIcon,
  CheckCircleIcon,
  EyeIcon,
  XCircleIcon,
  CalendarPlusIcon,
  ArchiveIcon,
  TrashIcon,
  GearIcon,
  WrenchIcon,
  EnvelopeIcon,
  ChartBarIcon,
} from '@phosphor-icons/react';

import { translate } from '@waldur/i18n';

import { ExpiringResourceMessage } from './ExpiringResourceMessage';
import { OrderPendingApprovalMessage } from './OrderPendingApprovalMessage';
import { ActionCategory, UserPendingActionType } from './types';

export const getActionTypeLabel = (actionType: string): string => {
  switch (actionType) {
    case UserPendingActionType.EXPIRING_RESOURCE:
      return translate('Resource expiring');
    case UserPendingActionType.PENDING_ORDER:
      return translate('Pending approval');
    default:
      return actionType
        ? actionType.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
        : translate('Action');
  }
};

export const ACTION_CATEGORY_CONFIG = {
  [ActionCategory.VIEW]: { icon: EyeIcon, variant: 'text-primary' },
  [ActionCategory.APPROVE]: { icon: CheckCircleIcon, variant: 'success' },
  [ActionCategory.REJECT]: { icon: XCircleIcon, variant: 'danger' },
  [ActionCategory.EXTEND]: { icon: CalendarPlusIcon, variant: 'warning' },
  [ActionCategory.BACKUP]: { icon: ArchiveIcon, variant: 'text-secondary' },
  [ActionCategory.TERMINATE]: { icon: TrashIcon, variant: 'danger' },
  [ActionCategory.CONFIGURE]: { icon: GearIcon, variant: 'text-secondary' },
  [ActionCategory.REPAIR]: { icon: WrenchIcon, variant: 'warning' },
  [ActionCategory.CONTACT]: { icon: EnvelopeIcon, variant: 'text-secondary' },
  [ActionCategory.MONITOR]: { icon: ChartBarIcon, variant: 'text-secondary' },
  [ActionCategory.SILENCE]: { icon: BellSlashIcon, variant: 'text-secondary' }, // For our built-in silence action
} as const;

export const PENDING_ACTION_COMPONENTS = {
  [UserPendingActionType.EXPIRING_RESOURCE]: ExpiringResourceMessage,
  [UserPendingActionType.PENDING_ORDER]: OrderPendingApprovalMessage,
};
