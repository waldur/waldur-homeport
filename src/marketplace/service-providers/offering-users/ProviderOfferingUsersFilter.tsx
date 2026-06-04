import { FunctionComponent, useMemo } from 'react';
import { OfferingUserState } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { translate } from '@/i18n';
import { OfferingFilter } from '@/marketplace/offerings/details/OfferingFilter';
import { ProviderFilter } from '@/marketplace/orders/ProviderFilter';
import { SelectFilter } from '@/table';
import { useCustomer } from '@/workspace/hooks';

export const PROVIDER_OFFERING_USERS_FORM_ID = 'ProviderOfferingUsersFilter';

interface ProviderOfferingUsersFilterProps {
  hasOrganizationColumn?: boolean;
}

const getOfferingUserStateFilterOptions = (): {
  value: OfferingUserState;
  label: string;
}[] => [
  { value: 'Creating', label: translate('Creating') },
  {
    value: 'Pending account linking',
    label: translate('Pending account linking'),
  },
  {
    value: 'Pending additional validation',
    label: translate('Pending additional validation'),
  },
  { value: 'OK', label: translate('OK') },
  { value: 'Requested deletion', label: translate('Requested deletion') },
  { value: 'Deleting', label: translate('Deleting') },
  { value: 'Deleted', label: translate('Deleted') },
  { value: 'Error creating', label: translate('Error creating') },
  { value: 'Error deleting', label: translate('Error deleting') },
];

const profileCompletenessOptions = [
  { value: undefined, label: translate('All') },
  { value: true, label: translate('Complete') },
  { value: false, label: translate('Incomplete') },
];

export const ProviderOfferingUsersFilter: FunctionComponent<
  ProviderOfferingUsersFilterProps
> = ({ hasOrganizationColumn }) => {
  const customer = useCustomer();
  const offeringFilter = useMemo(
    () => ({
      customer_uuid: hasOrganizationColumn ? undefined : customer?.uuid,
      billable: true,
      shared: true,
      state: undefined,
    }),
    [customer, hasOrganizationColumn],
  );

  return (
    <>
      <OfferingFilter
        badgeValue={(value) => value?.name}
        offeringFilter={offeringFilter}
      />
      <SelectFilter
        title={translate('State')}
        name="state"
        instantApply={false}
        placeholder={translate('Select state...')}
        options={getOfferingUserStateFilterOptions()}
        isClearable={true}
        isMulti
      />
      {hasOrganizationColumn && (
        <ProviderFilter getValueLabel={(option) => option.customer_name} />
      )}
      {ENV.plugins.WALDUR_CORE.ENFORCE_OFFERING_USER_PROFILE_COMPLETENESS && (
        <SelectFilter
          title={translate('Profile status')}
          name="has_complete_profile"
          getValueLabel={(value) =>
            profileCompletenessOptions.find((op) => op.value === value)?.label
          }
          instantApply={false}
          placeholder={translate('Select status')}
          options={profileCompletenessOptions}
          noUpdateOnBlur={true}
          simpleValue={true}
          isClearable={true}
        />
      )}
    </>
  );
};
