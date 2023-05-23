import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import {
  getBackendHealthStatus,
  isWorking,
} from '@waldur/navigation/BackendHealthStatusIndicator';

import { AdministrationProfile } from './AdministrationProfile';
import { HealthChecks } from './HealthChecks';
import { StatisticsCards } from './StatisticsCards';

export const AdministrationDashboard: FC = () => {
  const { data, isLoading, error, refetch } = useQuery(
    ['HealthStatus'],
    () => getBackendHealthStatus(),
    { staleTime: 5 * 60 * 1000 },
  );

  const healthy = isWorking(data);

  return (
    <>
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <LoadingErred
          message={translate('Unable to load health information')}
          loadData={refetch}
        />
      ) : data ? (
        <>
          <AdministrationProfile healthy={healthy} />
          <HealthChecks healthInfoItems={data} />
        </>
      ) : null}
      <StatisticsCards />
    </>
  );
};
