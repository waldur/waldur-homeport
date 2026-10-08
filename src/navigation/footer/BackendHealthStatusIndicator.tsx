import { CheckCircleIcon, XCircleIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';

import { Tooltip } from 'waldur-ui';

import { ENV } from '@/core/config';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
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
  const { data: value } = useQuery({
    queryKey: ['BackendHealthStatusIndicator'],
    queryFn: getBackendHealthStatus,
  });

  if (!value) return null;

  const working = isWorking(value);
  const label = working
    ? translate('Backend status: all services working')
    : translate('Backend status: some services failing');

  return (
    <span className="ms-8px">
      <Tooltip label={label}>
        <button
          type="button"
          className="text-btn"
          aria-label={label}
          onClick={() => openDialog(BackendHealthStatusDialog, { size: 'lg' })}
        >
          {working ? (
            <CheckCircleIcon
              size={20}
              weight="bold"
              className="text-success"
              aria-hidden
            />
          ) : (
            <XCircleIcon
              size={20}
              weight="bold"
              className="text-danger"
              aria-hidden
            />
          )}
        </button>
      </Tooltip>
    </span>
  );
};
