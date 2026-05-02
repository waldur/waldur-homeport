import type { ArrowSettings } from 'waldur-js-client';

import { useArrowSettings } from '../api';

import { ArrowSettingsDeleteAction } from './ArrowSettingsDeleteAction';
import { ArrowSettingsEditAction } from './ArrowSettingsEditAction';
import { ArrowSettingsPauseSyncAction } from './ArrowSettingsPauseSyncAction';
import { ArrowSettingsResumeSyncAction } from './ArrowSettingsResumeSyncAction';

interface ArrowSettingsActionsProps {
  settings: ArrowSettings;
}

export const ArrowSettingsActions = ({
  settings,
}: ArrowSettingsActionsProps) => {
  const { refetch } = useArrowSettings();

  return (
    <div className="d-flex gap-2">
      {settings.sync_enabled ? (
        <ArrowSettingsPauseSyncAction refetch={refetch} />
      ) : (
        <ArrowSettingsResumeSyncAction refetch={refetch} />
      )}
      <ArrowSettingsEditAction settings={settings} refetch={refetch} />
      <ArrowSettingsDeleteAction settingsUuid={settings.uuid} />
    </div>
  );
};
