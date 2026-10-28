import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@uirouter/react';
import { useCallback } from 'react';
import { usersList, versionRetrieve } from 'waldur-js-client';

import { FormField, FormLabel } from 'waldur-ui';

import { getIconUrl, parseSelectData } from '@/core/api';
import { ENV } from '@/core/config';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { SymbolsGroup } from '@/customer/dashboard/SymbolsGroup';
import { DashboardHeroLogo } from '@/dashboard/hero/DashboardHeroLogo';
import { translate } from '@/i18n';
import { getRoleFilterOptions } from '@/user/support/utils';

interface AdministrationProfileProps {
  healthy?: boolean;
  supportOnly?: boolean;
}

export const AdministrationProfile = ({
  healthy,
  supportOnly,
}: AdministrationProfileProps) => {
  const router = useRouter();

  const image = getIconUrl('login_logo');
  const website = ENV.plugins.WALDUR_CORE.HOMEPORT_URL;
  const email = ENV.plugins.WALDUR_CORE.SITE_EMAIL;
  const phone = ENV.plugins.WALDUR_CORE.SITE_PHONE;

  // Determine health display state
  const getHealthStatus = () => {
    if (healthy === undefined) {
      // Health check is still loading
      return {
        label: translate('Checking...'),
        className: 'border-[1px] border-warning text-warning',
      };
    }
    return {
      label: healthy ? translate('Healthy') : translate('Error'),
      className: healthy
        ? 'border-[1px] border-success text-success'
        : 'border-[1px] border-danger text-danger',
    };
  };

  const healthStatus = getHealthStatus();

  const { data: version } = useQuery({
    queryKey: ['version'],
    queryFn: () => versionRetrieve().then((r) => r.data),
    staleTime: Infinity,
  });

  const { data: value, isLoading: loading } = useQuery({
    queryKey: ['AdministrationProfile'],

    queryFn: () => {
      const promises = [
        !supportOnly &&
          usersList({ query: { page: 1, page_size: 6, is_staff: true } }).then(
            parseSelectData,
          ),
        usersList({ query: { page: 1, page_size: 6, is_support: true } }).then(
          parseSelectData,
        ),
      ];

      return Promise.all(promises);
    },
  });

  const [staff, supports] = value || [
    { options: [], totalItems: 0 },
    { options: [], totalItems: 0 },
  ];

  const goToUsers = useCallback(
    (isStaff = false, isSupport = false) => {
      const filter = {};
      const role = [];
      if (isStaff)
        role.push(
          getRoleFilterOptions().find((option) => option.value === 'is_staff'),
        );
      if (isSupport)
        role.push(
          getRoleFilterOptions().find(
            (option) => option.value === 'is_support',
          ),
        );
      if (role.length > 0)
        Object.assign(filter, { role: JSON.stringify(role) });
      router.stateService.go('support-users', filter);
    },
    [router],
  );

  return (
    <div className="card card-bordered mb-4">
      <div className="card-body">
        <div className="flex flex-wrap gap-x-5">
          <div className="flex-none mb-3">
            <DashboardHeroLogo
              logo={image}
              logoAlt={ENV.plugins.WALDUR_CORE.SITE_NAME}
              logoTopLabel={healthStatus.label}
              logoBottomLabel="Operator"
              logoTopClass={healthStatus.className}
              logoBottomClass="bg-neutral-subtle text-neutral"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="my-5 md:mt-0">
              <h2>{ENV.plugins.WALDUR_CORE.SITE_NAME}</h2>
              <div className="flex items-center self-stretch gap-5 text-quaternary">
                {version?.version && (
                  <span>
                    {translate('Version')}&nbsp;{version.version}
                  </span>
                )}
                {!supportOnly && website && <span>{website}</span>}
                {supportOnly && email && <span>{email}</span>}
                {supportOnly && phone && <span>{phone}</span>}
              </div>
            </div>
            <div>
              {loading ? (
                <LoadingSpinner />
              ) : (
                <div>
                  {!supportOnly && staff.options.length ? (
                    <FormField className="flex flex-wrap gap-x-5 mb-1">
                      <FormLabel className="flex-none mb-0 py-[10px]">
                        {translate('Staff')}:
                      </FormLabel>
                      <div className="flex-1 min-w-0">
                        <SymbolsGroup
                          items={staff.options}
                          max={6}
                          length={staff.totalItems}
                          onClick={() => goToUsers(true)}
                        />
                      </div>
                    </FormField>
                  ) : null}
                  {supports.options.length ? (
                    <FormField className="flex flex-wrap gap-x-5 mb-1">
                      <FormLabel className="flex-none mb-0 py-[10px]">
                        {translate('Support')}:
                      </FormLabel>
                      <div className="flex-1 min-w-0">
                        <SymbolsGroup
                          items={supports.options}
                          max={6}
                          length={supports.totalItems}
                          onClick={() => goToUsers(false, true)}
                        />
                      </div>
                    </FormField>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
