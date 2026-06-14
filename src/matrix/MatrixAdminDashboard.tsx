import { GearSixIcon, PlugsIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';
import { TableWithTabs } from '@/table/TableWithTabs';
import { isStaff as isStaffSelector } from '@/workspace/selectors';

import { MatrixAppserviceSetupDialog } from './MatrixAppserviceSetup';
import { MatrixDiagnosticsDialog } from './MatrixDiagnostics';
import { MatrixHowItWorksButton } from './MatrixHowItWorksButton';
import { isMatrixEnabled } from './utils';

const ROOMS_TAB = {
  key: 'rooms',
  title: translate('Rooms'),
  component: lazyComponent(() =>
    import('./MatrixAdminRoomsList').then((module) => ({
      default: module.MatrixAdminRoomsList,
    })),
  ),
};

// Settings exposes appservice config whose backend endpoints are staff-only,
// so the tab is staff-gated; support sees only the rooms list.
const SETTINGS_TAB = {
  key: 'settings',
  title: translate('Settings'),
  component: lazyComponent(() =>
    import('./MatrixAdminSettingsTab').then((module) => ({
      default: module.MatrixAdminSettingsTab,
    })),
  ),
};

export const MatrixAdminDashboard = () => {
  const { openDialog } = useModal();
  const staff = useSelector(isStaffSelector);
  const tabs = staff ? [ROOMS_TAB, SETTINGS_TAB] : [ROOMS_TAB];
  // The dashboard stays reachable while Matrix is off so staff can toggle
  // MATRIX_ENABLED in the Settings tab; the appservice setup only makes sense
  // once the integration is on, so disable it with an explanatory tooltip.
  const matrixEnabled = isMatrixEnabled();

  const openSetupDialog = useCallback(() => {
    openDialog(MatrixAppserviceSetupDialog, { size: 'lg' });
  }, [openDialog]);

  const openDiagnostics = useCallback(() => {
    openDialog(MatrixDiagnosticsDialog, { size: 'lg' });
  }, [openDialog]);

  return (
    <TableWithTabs
      title={translate('Matrix chat')}
      subtitle={translate(
        'Manage Matrix appservice configuration, chat rooms, and history exports.',
      )}
      tabs={tabs}
      syncWithUrlKey="tab"
      headerActions={
        <>
          <MatrixHowItWorksButton />
          {staff && (
            <>
              <ActionButton
                title={translate('Check connectivity')}
                action={openDiagnostics}
                iconNode={<PlugsIcon weight="bold" />}
                variant="tertiary"
              />
              <ActionButton
                title={translate('Setup appservice')}
                action={openSetupDialog}
                iconNode={<GearSixIcon weight="bold" />}
                variant="tertiary"
                disabled={!matrixEnabled}
                disabledReason={translate(
                  'Enable Matrix chat in the Settings tab before configuring the appservice.',
                )}
              />
            </>
          )}
        </>
      }
    />
  );
};
