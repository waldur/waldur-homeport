import { FunctionComponent } from 'react';

import { StateIndicator, StateVariant } from '@waldur/core/StateIndicator';

export type BackupStateType = 'Unsupported' | 'Unset' | 'Warning' | 'OK';

const LABEL_CLASSES: { [key in BackupStateType]: StateVariant } = {
  Unsupported: 'plain',
  Unset: 'danger',
  Warning: 'warning',
  OK: 'info',
};

interface BackupStateIndicatorProps {
  resource: {
    backup_state: BackupStateType;
    last_backup?: string;
  };
}

export const BackupState: FunctionComponent<BackupStateIndicatorProps> = (
  props,
) => (
  <StateIndicator
    label={props.resource.backup_state}
    variant={LABEL_CLASSES[props.resource.backup_state] || 'info'}
    tooltip={props.resource.last_backup}
  />
);
