import { useQuery } from '@tanstack/react-query';
import { overrideSettingsRetrieve } from 'waldur-js-client';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';

import { SettingsCard } from '../settings/SettingsCard';

export const AdministrationSshKeys = () => {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['AdministrationSshKeys'],
    queryFn: () => overrideSettingsRetrieve().then((response) => response.data),
  });

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return (
      <LoadingErred
        message={translate('Unable to load SSH key settings.')}
        loadData={refetch}
      />
    );

  return data ? (
    <SettingsCard groupNames={[translate('SSH keys')]} settingsSource={data} />
  ) : null;
};
