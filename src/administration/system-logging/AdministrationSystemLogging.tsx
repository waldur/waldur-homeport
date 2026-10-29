import { useQuery } from '@tanstack/react-query';
import { overrideSettingsRetrieve } from 'waldur-js-client';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';

import { SettingsCard } from '../settings/SettingsCard';

export const AdministrationSystemLogging = () => {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['AdministrationSystemLogging'],
    queryFn: () => overrideSettingsRetrieve().then((response) => response.data),
  });

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return (
      <LoadingErred
        message={translate('Unable to load system logging configuration.')}
        loadData={refetch}
      />
    );

  return data ? (
    <div className="pt-4">
      <SettingsCard
        groupNames={[
          translate('System Logging'),
          translate('Site Agent Logs'),
          translate('User Revision History'),
        ]}
        settingsSource={data}
      />
    </div>
  ) : null;
};
