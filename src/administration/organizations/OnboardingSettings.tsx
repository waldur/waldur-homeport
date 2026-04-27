import { useQuery } from '@tanstack/react-query';
import { overrideSettingsRetrieve } from 'waldur-js-client';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';

import { SettingsCard } from '../settings/SettingsCard';

import { OnboardingSetup } from './onboarding-setup/OnboardingSetup';

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
    <>
      <OnboardingSetup />
      <hr />
      <SettingsCard
        groupNames={[translate('Onboarding settings')]}
        settingsSource={data}
      />
    </>
  ) : null;
};
