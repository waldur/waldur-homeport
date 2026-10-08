import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { FC, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { customersRetrieve } from 'waldur-js-client';

import { AsyncSelect } from '@/form/select';
import { translate } from '@/i18n';
import { organizationAutocomplete } from '@/marketplace/common/autocompletes';
import { useUser } from '@/workspace/hooks';
import { isStaffOrSupport } from '@/workspace/selectors';

import { getReportingOrganizations, ReportingOrganization } from './access';

/**
 * Organization the reporting pages are scoped to. It lives in the
 * `organization_uuid` param of the `reporting` state, so it survives
 * navigation between the landing page and the reports, and links are
 * shareable. Staff and support may pick any organization; everyone else only
 * one they own, and it is preselected when there is just one.
 */
export const useReportingOrganization = () => {
  const user = useUser();
  const canSelectAny = useSelector(isStaffOrSupport);
  const organizations = useMemo(() => getReportingOrganizations(user), [user]);
  const router = useRouter();
  const { params } = useCurrentStateAndParams();
  const requested: string = params.organization_uuid;

  const onlyOrganization =
    !canSelectAny && organizations.length === 1 ? organizations[0] : null;
  const known = organizations.find((org) => org.uuid === requested);
  const uuid = canSelectAny
    ? requested
    : (known?.uuid ?? onlyOrganization?.uuid ?? null);
  const knownName = organizations.find((org) => org.uuid === uuid)?.name;

  const { data: fetched } = useQuery({
    queryKey: ['ReportingOrganization', uuid],
    queryFn: () =>
      customersRetrieve({
        path: { uuid },
        query: { field: ['uuid', 'name'] },
      }).then((response) => response.data),
    enabled: !!uuid && !knownName,
    staleTime: Infinity,
  });

  const organization: ReportingOrganization = uuid
    ? { uuid, name: knownName ?? fetched?.name ?? '' }
    : null;

  const setOrganization = useCallback(
    (org: ReportingOrganization | null) =>
      router.stateService.go('.', { organization_uuid: org?.uuid ?? null }),
    [router],
  );

  return {
    organization,
    organizations,
    canSelectAny,
    isLocked: !!onlyOrganization,
    setOrganization,
  };
};

interface ReportingOrganizationSelectProps {
  /** Replaces the default param update, e.g. to reset dependent params with it */
  onChange?(organization: ReportingOrganization | null): void;
}

export const ReportingOrganizationSelect: FC<
  ReportingOrganizationSelectProps
> = ({ onChange }) => {
  const {
    organization,
    organizations,
    canSelectAny,
    isLocked,
    setOrganization,
  } = useReportingOrganization();

  const loadOptions = useMemo(() => {
    if (canSelectAny) {
      return organizationAutocomplete();
    }
    return (query: string) =>
      Promise.resolve({
        options: organizations.filter((org) =>
          org.name?.toLowerCase().includes(query.toLowerCase()),
        ),
        hasMore: false,
      });
  }, [canSelectAny, organizations]);

  return (
    <div className="w-100 mw-300px min-w-200px">
      <AsyncSelect
        placeholder={translate('Select organization...')}
        loadOptions={loadOptions}
        defaultOptions
        getOptionValue={(option: ReportingOrganization) => option.uuid}
        getOptionLabel={(option: ReportingOrganization) => option.name}
        value={organization}
        onChange={onChange ?? setOrganization}
        noOptionsMessage={() => translate('No organizations')}
        isClearable={!isLocked}
        isDisabled={isLocked}
        aria-label={translate('Organization')}
      />
    </div>
  );
};
