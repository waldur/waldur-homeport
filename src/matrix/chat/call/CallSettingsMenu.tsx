import { useMediaDeviceSelect } from '@livekit/components-react';
import { GearSixIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';

import { Select } from '@/form/select/Select';
import { translate } from '@/i18n';

interface CallSettingsMenuProps {
  /**
   * Render the popover (and the select menus) inside this element. Needed when
   * the call is fullscreened — the Fullscreen API only paints the fullscreened
   * subtree, so anything portaled to <body> would be invisible.
   */
  container?: HTMLElement | null;
}

interface DeviceSelectProps {
  kind: MediaDeviceKind;
  label: string;
  menuTarget?: HTMLElement | null;
}

const DeviceSelect: FC<DeviceSelectProps> = ({ kind, label, menuTarget }) => {
  const { devices, activeDeviceId, setActiveMediaDevice } =
    useMediaDeviceSelect({ kind });
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
        onChange={(option: any) => option && setActiveMediaDevice(option.value)}
        isSearchable={false}
        menuPlacement="auto"
        // Only override the portal target when fullscreen forces the menu into
        // the call subtree. Passing `undefined` otherwise would clobber the
        // hook's `document.body` default and the menu renders clipped inside
        // the popover instead of floating above it.
        {...(menuTarget ? { menuPortalTarget: menuTarget } : {})}
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
    <OverlayTrigger
      trigger="click"
      rootClose
      transition={false}
      placement="top"
      container={container ?? undefined}
      overlay={
        <Popover
          id="call-device-settings"
          className="call-device-settings-popover"
        >
          <Popover.Body className="call-device-settings">
            {kinds.map(({ kind, label }) => (
              <DeviceSelect
                key={kind}
                kind={kind}
                label={label}
                menuTarget={container}
              />
            ))}
          </Popover.Body>
        </Popover>
      }
    >
      <button
        type="button"
        className="lk-button"
        title={translate('Audio & video settings')}
      >
        <GearSixIcon size={20} weight="bold" />
      </button>
    </OverlayTrigger>
  );
};
