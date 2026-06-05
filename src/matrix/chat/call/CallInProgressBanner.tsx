import { PhoneIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { translate } from '@/i18n';

import { useMatrixClient } from '../useMatrixClient';

import { useMatrixCall } from './useMatrixCall';

const DEVICE_ID_KEY = 'waldur_matrix_device_id';

export const CallInProgressBanner: FC = () => {
  const { callState, callMembers, startCall } = useMatrixCall();
  const { userId } = useMatrixClient();

  // Only show when we're not in a call but others are
  if (callState !== 'idle' && callState !== 'error') return null;
  if (callMembers.length === 0) return null;

  const myDeviceId = sessionStorage.getItem(DEVICE_ID_KEY) || '';
  const otherMembers = callMembers.filter(
    (m) => m.userId !== userId || m.deviceId !== myDeviceId,
  );

  if (otherMembers.length === 0) return null;

  const names = otherMembers.map((m) => m.displayName).join(', ');

  return (
    <div className="d-flex align-items-center gap-2 px-4 py-2 bg-light-success border-bottom">
      <PhoneIcon size={16} className="text-success" weight="fill" />
      <span className="text-sm flex-grow-1">
        {translate('Call in progress')}: {names}
      </span>
      <button
        type="button"
        className="btn btn-sm btn-success"
        onClick={startCall}
      >
        {translate('Join')}
      </button>
    </div>
  );
};
