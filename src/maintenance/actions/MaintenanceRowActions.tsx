import { ActionsDropdown } from '@/table/ActionsDropdown';

import { MaintenanceDeleteAction } from './MaintenanceDeleteAction';
import { MaintenanceEditAction } from './MaintenanceEditAction';
import { MaintenanceHistoryLogAction } from './MaintenanceHistoryLogAction';
import { MaintenanceStateActions } from './MaintenanceStateActions';
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
              MaintenanceViewAction,
              MaintenanceEditAction,
              MaintenanceStateActions,
              MaintenanceDeleteAction,
            ].filter(Boolean)
          : [
              // Admin actions
              MaintenanceViewAction,
              MaintenanceEditAction,
              MaintenanceHistoryLogAction,
              MaintenanceStateActions,
            ].filter(Boolean)
      }
    />
  );
};
