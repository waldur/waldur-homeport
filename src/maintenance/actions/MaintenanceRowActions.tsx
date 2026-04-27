import { ActionsDropdown } from '@/table/ActionsDropdown';

import { MaintenanceDeleteAction } from './MaintenanceDeleteAction';
import { MaintenanceEditAction } from './MaintenanceEditAction';
import { MaintenanceHistoryLogAction } from './MaintenanceHistoryLogAction';
import { MaintenanceStateActions } from './MaintenanceStateActions';
import { MaintenanceStopAction } from './MaintenanceStopAction';
import { MaintenanceViewAction } from './MaintenanceViewAction';

export const MaintenanceRowActions = ({ provider, row, fetch }) => {
  return (
    <ActionsDropdown
      row={row}
      refetch={fetch}
      data={{ provider }}
      actions={
        provider
          ? [
              // Service provider actions
              MaintenanceEditAction,
              MaintenanceViewAction,
              MaintenanceStateActions,
              MaintenanceDeleteAction,
            ].filter(Boolean)
          : [
              // Admin actions
              MaintenanceViewAction,
              MaintenanceEditAction,
              MaintenanceHistoryLogAction,
              MaintenanceStopAction,
            ].filter(Boolean)
      }
    />
  );
};
