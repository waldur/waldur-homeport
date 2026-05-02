import { CheckCircleIcon, XCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { useAsync } from 'react-use';

import { ENV } from '@/core/config';
import { lazyComponent } from '@/core/lazyComponent';
import { useModal } from '@/modal/actions';

const BackendHealthStatusDialog = lazyComponent(() =>
  import('./BackendHealthStatusDialog').then((module) => ({
    default: module.BackendHealthStatusDialog,
  })),
);

export const getBackendHealthStatus = async () => {
  const headers = new Headers();
  headers.append('Accept', 'application/json');

  const response = await fetch(`${ENV.apiEndpoint}health-check/`, {
    headers,
  });
  return await response.json();
};

export const isWorking = (data: Record<string, string>): boolean => {
  if (!data) return false;
  return Object.values(data).every((item) => item === 'working');
};

export const BackendHealthStatusIndicator: FC = () => {
  const { openDialog } = useModal();
  const { value } = useAsync(getBackendHealthStatus, []);

  if (!value) return null;

  return (
    <span className="ms-8px">
      <button
        type="button"
        className="text-btn"
        onClick={() => openDialog(BackendHealthStatusDialog, { size: 'lg' })}
      >
        {isWorking(value) ? (
          <CheckCircleIcon size={20} weight="bold" className="text-success" />
        ) : (
          <XCircleIcon size={20} weight="bold" className="text-danger" />
        )}
      </button>
    </span>
  );
};
