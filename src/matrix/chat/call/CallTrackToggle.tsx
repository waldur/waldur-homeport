import { TrackToggle } from '@livekit/components-react';
import { FC, useCallback } from 'react';

import { Tooltip } from 'waldur-ui';

import { useNotify } from '@/store/notify';

import {
  CallDeviceSource,
  getCallDeviceErrorMessage,
} from './callDeviceErrors';

/**
 * A control-bar toggle for the microphone, camera or screen share that tells
 * the user when the device could not be started. Without onDeviceError,
 * LiveKit swallows the failure and the button just stays off.
 */
export const CallTrackToggle: FC<{
  source: CallDeviceSource;
  label: string;
}> = ({ source, label }) => {
  const { showError } = useNotify();
  // useTrackToggle captures this callback once per room and source, so it
  // must not depend on anything that changes during the call.
  const onDeviceError = useCallback(
    (error: Error) => {
      const message = getCallDeviceErrorMessage(error, source);
      if (message) {
        showError(message);
      }
    },
    [source, showError],
  );

  return (
    <Tooltip label={label} side="top">
      <span>
        <TrackToggle source={source} onDeviceError={onDeviceError} />
      </span>
    </Tooltip>
  );
};
