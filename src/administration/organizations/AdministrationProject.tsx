import { useQuery } from '@tanstack/react-query';
import { overrideSettingsRetrieve } from 'waldur-js-client';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';

import { SettingsCard } from '../settings/SettingsCard';

export const AdministrationProject = () => {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['AdministrationProject'],
    queryFn: () => overrideSettingsRetrieve().then((response) => response.data),
  });

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return (
      <LoadingErred
        message={translate('Unable to load project settings.')}
        loadData={refetch}
      />
    );

  return data ? (
    <SettingsCard
      groupNames={[translate('Project'), translate('Project Digest')]}
      settingsSource={data}
    />
  ) : null;
};
