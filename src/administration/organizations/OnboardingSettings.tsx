import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { overrideSettingsRetrieve } from 'waldur-js-client';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { isStaff as isStaffSelector } from '@/workspace/selectors';

import { SettingsCard } from '../settings/SettingsCard';

import { OnboardingSetup } from './onboarding-setup/OnboardingSetup';

export const OnboardingSettings = () => {
  // The checklist setup reads checklists-admin, which is staff-only; support
  // users still see the settings below it.
  const isStaff = useSelector(isStaffSelector);
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
    <div className="pt-5">
      {isStaff && (
        <>
          <OnboardingSetup />
          <hr />
        </>
      )}
      <SettingsCard
        groupNames={[translate('Onboarding settings')]}
        settingsSource={data}
      />
    </div>
  ) : null;
};
