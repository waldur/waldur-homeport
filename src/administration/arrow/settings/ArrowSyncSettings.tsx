import { useQuery } from '@tanstack/react-query';
import { overrideSettingsRetrieve } from 'waldur-js-client';

import { SettingsCard } from '@/administration/settings/SettingsCard';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';

export const ArrowSyncSettings = () => {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['ArrowSyncSettings'],
    queryFn: () => overrideSettingsRetrieve().then((response) => response.data),
  });

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return (
      <LoadingErred
        message={translate('Unable to load Arrow sync settings.')}
        loadData={refetch}
      />
    );

  return data ? (
    <SettingsCard
      groupNames={[translate('Arrow Integration')]}
      settingsSource={data}
    />
  ) : null;
};
