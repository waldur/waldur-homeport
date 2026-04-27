import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';

import { STALE_TIME } from '@/core/constants';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import {
  getBackendHealthStatus,
  isWorking,
} from '@/navigation/footer/BackendHealthStatusIndicator';

import { AdministrationProfile } from './AdministrationProfile';
import { AdminStatistics } from './AdminStatistics';
import { HealthChecks } from './HealthChecks';

export const AdministrationDashboard: FC = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['HealthStatus'],
    queryFn: () => getBackendHealthStatus(),
    staleTime: STALE_TIME,
  });

  const healthy = data ? isWorking(data) : undefined;

  return (
    <>
      <AdministrationProfile healthy={healthy} />
      {isLoading ? (
        <LoadingSpinner
          helpText={translate(
            'Checking system health status and verifying all services are operational...',
          )}
        />
      ) : error ? (
        <LoadingErred
          message={translate('Unable to load health information')}
          loadData={refetch}
        />
      ) : data ? (
        <HealthChecks healthInfoItems={data} />
      ) : null}
      <AdminStatistics />
    </>
  );
};
