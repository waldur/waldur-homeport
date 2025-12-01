import { useQuery } from '@tanstack/react-query';
import { overrideSettingsRetrieve } from 'waldur-js-client';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';

import { SettingsCard } from '../settings/SettingsCard';

export const OnboardingSettings = () => {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['AdministrationOnboarding'],
    queryFn: () => overrideSettingsRetrieve().then((response) => response.data),
  });

  return isLoading ? (
    <LoadingSpinner />
  ) : error ? (
    <LoadingErred
      message={translate('Unable to load onboarding configurations.')}
      loadData={refetch}
    />
  ) : data ? (
    <SettingsCard
      groupNames={[translate('Onboarding settings')]}
      settingsSource={data}
    />
  ) : null;
};
