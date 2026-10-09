import { PhonePlusIcon, WarningCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { BaseButton, FeaturedIcon } from 'waldur-ui';

import { translate } from '@/i18n';

import { useMatrixClient } from '../useMatrixClient';

import { getCallDeviceId } from './callMembership';
import { useMatrixCall } from './useMatrixCall';

export const CallInProgressBanner: FC = () => {
  const { callState, callMembers, startCall } = useMatrixCall();
  const { client, userId } = useMatrixClient();

  // Only show when we're not in a call but others are
  if (callState !== 'idle' && callState !== 'error') return null;
  if (callMembers.length === 0) return null;

  const myDeviceId = getCallDeviceId(client);
  const otherMembers = callMembers.filter(
    (m) => m.userId !== userId || m.deviceId !== myDeviceId,
  );

  if (otherMembers.length === 0) return null;

  return (
    <div className="call-in-progress-banner d-flex align-items-center">
      <FeaturedIcon
        icon={<WarningCircleIcon weight="bold" />}
        variant="warning"
        size="sm"
      />
      <span className="call-in-progress-banner__label flex-grow-1 text-truncate">
        {translate('Call in progress')}
      </span>
      <BaseButton
        variant="tertiary"
        size="sm"
        onClick={startCall}
        iconNode={<PhonePlusIcon size={16} weight="bold" />}
        label={translate('Join call')}
      />
    </div>
  );
};
