import { useQuery } from '@tanstack/react-query';
import { overrideSettingsRetrieve } from 'waldur-js-client';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';

import { SettingsCard } from '../settings/SettingsCard';

export const AdministrationPersonalAccessTokens = () => {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['AdministrationPersonalAccessTokens'],
    queryFn: () => overrideSettingsRetrieve().then((response) => response.data),
  });

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return (
      <LoadingErred
        message={translate('Unable to load personal access token settings.')}
        loadData={refetch}
      />
    );

  return data ? (
    <SettingsCard
      groupNames={[translate('Personal Access Tokens')]}
      settingsSource={data}
    />
  ) : null;
};
