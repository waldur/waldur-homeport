export type HistoryEntityType =
  'resource' | 'customer' | 'user' | 'ssh_key' | 'offering' | 'plan';

export interface VersionHistoryButtonProps {
  entityType: HistoryEntityType;
  entityUuid: string;
  entityName: string;
  asDropdownItem?: boolean;
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
