import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';
import { ActionsDropdown } from '@waldur/table/ActionsDropdown';

import { MaintenanceDeleteAction } from './MaintenanceDeleteAction';
import { MaintenanceEditAction } from './MaintenanceEditAction';
import { MaintenanceHistoryLogAction } from './MaintenanceHistoryLogAction';
import { MaintenanceStopAction } from './MaintenanceStopAction';
import { MaintenanceViewAction } from './MaintenanceViewAction';

export const MaintenanceRowActions = ({ provider, row, fetch }) => {
  const showExperimentalUiComponents = isExperimentalUiComponentsVisible();

  return (
    <ActionsDropdown
      row={row}
      refetch={fetch}
      data={{ provider }}
      actions={
        provider
          ? [
              // Service provider actions
              showExperimentalUiComponents && MaintenanceEditAction,
              MaintenanceViewAction,
              MaintenanceDeleteAction,
            ].filter(Boolean)
          : [
              // Admin actions
              MaintenanceViewAction,
              showExperimentalUiComponents && MaintenanceEditAction,
              showExperimentalUiComponents && MaintenanceHistoryLogAction,
              showExperimentalUiComponents && MaintenanceStopAction,
            ].filter(Boolean)
      }
    />
  );
};
