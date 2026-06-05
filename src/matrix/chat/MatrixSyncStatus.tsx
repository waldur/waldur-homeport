import { FC } from 'react';

import { translate } from '@/i18n';

import { MatrixConnectionState } from './types';

interface MatrixSyncStatusProps {
  state: MatrixConnectionState;
  error: string | null;
}

export const MatrixSyncStatus: FC<MatrixSyncStatusProps> = ({
  state,
  error,
}) => {
  if (state === 'connected' || state === 'idle') return null;

  const config: Record<string, { bg: string; text: string }> = {
    connecting: {
      bg: 'bg-warning',
      text: translate('Connecting to chat...'),
    },
    error: {
      bg: 'bg-danger text-white',
      text: error || translate('Connection error'),
    },
    disconnected: {
      bg: 'bg-secondary text-white',
      text: translate('Disconnected'),
    },
  };

  const { bg, text } = config[state] || config.connecting;

  return (
    <div className={`${bg} text-center py-1`} style={{ fontSize: '0.75rem' }}>
      {text}
    </div>
  );
};
