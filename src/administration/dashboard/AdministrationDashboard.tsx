import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import {
  getBackendHealthStatus,
  isWorking,
} from '@waldur/navigation/footer/BackendHealthStatusIndicator';

import { AdministrationProfile } from './AdministrationProfile';
import { AdminStatistics } from './AdminStatistics';
import { HealthChecks } from './HealthChecks';

export const AdministrationDashboard: FC = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['HealthStatus'],
    queryFn: () => getBackendHealthStatus(),
    staleTime: 5 * 60 * 1000,
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
