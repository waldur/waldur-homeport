import { FC } from 'react';
import { useAsyncFn, useEffectOnce } from 'react-use';

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
  const [{ loading, error, value }, reFetch] = useAsyncFn(
    getBackendHealthStatus,
    [],
  );

  useEffectOnce(() => {
    reFetch();
  });

  const healthy = isWorking(value);

  return (
    <>
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <LoadingErred
          message={translate('Unable to load health information')}
          loadData={reFetch}
        />
      ) : value ? (
        <>
          <AdministrationProfile healthy={healthy} />
          <HealthChecks healthInfoItems={value} />
        </>
      ) : null}
      <StatisticsCards />
    </>
  );
};
