import { useQuery } from '@tanstack/react-query';
import { useEffectOnce } from 'react-use';
import { freeipaProfilesList } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { goToNotFound } from '@/error/utils';
import { translate } from '@/i18n';
import { useNotify } from '@/store/notify';
import { useUser } from '@/workspace/hooks';

import { FreeIPAAccountCreate } from './FreeIPAAccountCreate';
import { FreeIPAAccountEdit } from './FreeIPAAccountEdit';
import { SyncProfile } from './SyncProfile';

export const FreeIpaAccount = () => {
  const user = useUser();
  const { showError } = useNotify();

  if (!ENV.plugins.WALDUR_CORE.FREEIPA_ENABLED) {
    showError(translate('FreeIPA extension is disabled.'));
    goToNotFound();
  }

  const {
    isLoading,
    error,
    data: profile,
    refetch: refreshProfile,
  } = useQuery({
    queryKey: ['FreeIPAAccount', user.uuid],
    queryFn: () =>
      freeipaProfilesList({ query: { user: user.uuid } }).then(
        // null, not undefined — React Query rejects an undefined result (e.g. empty list).
        (r) => r.data[0] ?? null,
      ),
  });

  useEffectOnce(() => {
    refreshProfile();
  });
  if (isLoading) return <LoadingSpinner />;

  if (error) return <>{translate('Unable to load data.')}</>;

  return (
    <div className="card card-bordered">
      <div className="card-header">
        <div className="card-toolbar flex flex-wrap gap-3 w-full">
          <div className="flex-1 min-w-0 order-0 sm:max-w-1/4">
            <div className="card-title">
              <span className="h3 me-1.5">{translate('FreeIPA account')}</span>
            </div>
          </div>
          {profile && (
            <div className="w-full sm:w-auto sm:flex-none order-1 sm:order-2 min-w-1/4 ms-auto">
              <div className="flex sm:justify-end max-sm:flex-wrap whitespace-nowrap gap-2.5">
                <SyncProfile
                  profile={profile}
                  refreshProfile={refreshProfile}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="card-body">
        {profile ? (
          <FreeIPAAccountEdit profile={profile} />
        ) : (
          <FreeIPAAccountCreate onProfileAdded={refreshProfile} />
        )}
      </div>
    </div>
  );
};
