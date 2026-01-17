import { User, UserAction } from 'waldur-js-client';

export interface OwnProps {
  user: User;
}

export type UrgencyLevel = 'high' | 'medium' | 'low';

export interface PendingActionsFilter {
  include_silenced?: boolean;
  action_type?: string;
  urgency?: UrgencyLevel;
  overdue?: boolean;
}

// Based on ACTION_CATEGORY_CONFIG keys
export enum ActionCategory {
  VIEW = 'view',
  APPROVE = 'approve',
  REJECT = 'reject',
  EXTEND = 'extend',
  BACKUP = 'backup',
  TERMINATE = 'terminate',
  CONFIGURE = 'configure',
  REPAIR = 'repair',
  CONTACT = 'contact',
  MONITOR = 'monitor',
  SILENCE = 'silence',
}

export enum UserPendingActionType {
  EXPIRING_RESOURCE = 'expiring_resource',
  PENDING_ORDER = 'pending_order',
}

export interface CorrectiveAction {
  label: string;
  category: ActionCategory | string;
  severity: string;
  method?: string;
  api_endpoint?: boolean;
  confirmation_required?: boolean;
  permissions_required?: string[];
  metadata?: Record<string, any>;
  route_name?: string;
  route_params?: Record<string, any>;
}

// Extended UserAction interface with new typed fields
export interface ExtendedUserAction extends Omit<UserAction, 'route_params'> {
  route_name?: string;
  route_params?: Record<string, any>;
  project_name?: string;
  project_uuid?: string;
  organization_name?: string;
  organization_uuid?: string;
  offering_name?: string;
  offering_uuid?: string;
  offering_type?: string;
  resource_name?: string;
  resource_uuid?: string;
  order_type?: string;
}
