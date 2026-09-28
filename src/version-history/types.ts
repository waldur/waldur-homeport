import { ButtonVariant, ButtonSize } from 'waldur-ui';

export type HistoryEntityType =
  'resource' | 'customer' | 'user' | 'ssh_key' | 'offering' | 'plan';

export interface VersionHistoryButtonProps {
  entityType: HistoryEntityType;
  entityUuid: string;
  entityName: string;
  asDropdownItem?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
  className?: string;
}

export interface VersionHistoryDialogProps {
  entityType: HistoryEntityType;
  entityUuid: string;
  entityName: string;
}

export interface FieldDiff {
  field: string;
  label: string;
  oldValue: unknown;
  newValue: unknown;
  changed: boolean;
}
