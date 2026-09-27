import { useQuery } from '@tanstack/react-query';
import { overrideSettingsRetrieve } from 'waldur-js-client';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';

import { SettingsCard } from '../settings/SettingsCard';

import { TelemetrySendingCard } from './TelemetrySendingCard';

export const AdministrationTelemetry = () => {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['AdministrationTelemetry'],
    queryFn: () => overrideSettingsRetrieve().then((response) => response.data),
  });

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return (
      <LoadingErred
        message={translate('Unable to load telemetry configuration.')}
        loadData={refetch}
      />
    );

  return (
    <div className="pt-5">
      <TelemetrySendingCard />
      {data ? (
        <SettingsCard
          groupNames={[translate('Telemetry')]}
          settingsSource={data}
        />
      ) : null}
    </div>
  );
};
