import { CheckCircleIcon, XCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { useDispatch } from 'react-redux';
import { useAsync } from 'react-use';

import { ENV } from '@waldur/core/config';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';

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
  const dispatch = useDispatch();
  const { value } = useAsync(getBackendHealthStatus, []);

  if (!value) return null;

  return (
    <span className="me-2">
      <button
        type="button"
        className="text-btn"
        onClick={() =>
          dispatch(openModalDialog(BackendHealthStatusDialog, { size: 'lg' }))
        }
      >
        {isWorking(value) ? (
          <CheckCircleIcon size={20} className="text-success" />
        ) : (
          <XCircleIcon size={20} className="text-danger" />
        )}
      </button>
    </span>
  );
};
