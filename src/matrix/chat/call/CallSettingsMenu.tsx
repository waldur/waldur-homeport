import { useMediaDeviceSelect } from '@livekit/components-react';
import { GearSixIcon } from '@phosphor-icons/react';
import { Track } from 'livekit-client';
import { FC } from 'react';

import { Popover, PopoverContent, PopoverTrigger, Select } from 'waldur-ui';

import { translate } from '@/i18n';
import { useNotify } from '@/store/notify';

import {
  CallDeviceSource,
  classifyCallDeviceError,
  getCallDeviceErrorMessage,
} from './callDeviceErrors';

interface CallSettingsMenuProps {
  /**
   * Render the popover inside this element. Needed when the call is
   * fullscreened — the Fullscreen API only paints the fullscreened subtree, so
   * anything portaled to <body> would be invisible. Everywhere else it stays
   * in <body>: Safari mis-paints the drawer's content while a fixed layer sits
   * inside the drawer.
   */
  container?: HTMLElement | null;
}

interface DeviceSelectProps {
  kind: MediaDeviceKind;
  label: string;
}

const DEVICE_SOURCES: Partial<Record<MediaDeviceKind, CallDeviceSource>> = {
  audioinput: Track.Source.Microphone,
  videoinput: Track.Source.Camera,
};

const getGenericSwitchError = (kind: MediaDeviceKind): string => {
  switch (kind) {
    case 'videoinput':
      return translate('Could not switch the camera.');
    case 'audioinput':
      return translate('Could not switch the microphone.');
    default:
      return translate('Could not switch the speaker.');
  }
};

const getSwitchErrorMessage = (error: Error, kind: MediaDeviceKind): string => {
  const source = DEVICE_SOURCES[kind];
  if (!source || classifyCallDeviceError(error, source) === 'other') {
    return getGenericSwitchError(kind);
  }
  return (
    getCallDeviceErrorMessage(error, source) ?? getGenericSwitchError(kind)
  );
};

const DeviceSelect: FC<DeviceSelectProps> = ({ kind, label }) => {
  const { showError } = useNotify();
  const { devices, activeDeviceId, setActiveMediaDevice } =
    useMediaDeviceSelect({ kind });
  // LiveKit only moves activeDeviceId once the switch has succeeded, so after
  // a failure the select falls back to the device that is still in use.
  const switchDevice = async (deviceId: string) => {
    try {
      await setActiveMediaDevice(deviceId);
    } catch (error) {
      showError(getSwitchErrorMessage(error as Error, kind));
    }
  };
  const options = devices.map((d) => ({
    value: d.deviceId,
    label: d.label || translate('Unknown device'),
  }));
  const value = options.find((o) => o.value === activeDeviceId) ?? null;

  return (
    <div className="call-device-settings__group">
      <div className="call-device-settings__label">{label}</div>
      <Select
        options={options}
        value={value}
        onChange={(option: any) => option && switchDevice(option.value)}
        isSearchable={false}
        menuPlacement="auto"
        // Inline in the popover rather than a fixed menu portalled elsewhere,
        // so it moves with the popover wherever that portals and adds no
        // second fixed layer for Safari to mis-composite.
        menuPortalTarget={null}
        menuPosition="absolute"
      />
    </div>
  );
};

/**
 * In-call device picker: a control-bar button that opens a popover letting the
 * user switch microphone, speaker and camera mid-call. Rendered inside
 * <LiveKitRoom> (the control bar) so the device hooks reach the active room.
 */
export const CallSettingsMenu: FC<CallSettingsMenuProps> = ({ container }) => {
  const kinds: { kind: MediaDeviceKind; label: string }[] = [
    { kind: 'audioinput', label: translate('Microphone') },
    { kind: 'audiooutput', label: translate('Speaker') },
    { kind: 'videoinput', label: translate('Camera') },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="lk-button"
          title={translate('Audio & video settings')}
        >
          <GearSixIcon size={20} weight="bold" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        container={container ?? undefined}
        side="top"
        sideOffset={2}
        // The docked call belongs to MatrixCallHost's React tree, not the
        // drawer's, so the drawer would read clicks here as a click away.
        data-dialog-inside=""
        className="call-device-settings-popover p-4"
      >
        <div className="call-device-settings">
          {kinds.map(({ kind, label }) => (
            <DeviceSelect key={kind} kind={kind} label={label} />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
