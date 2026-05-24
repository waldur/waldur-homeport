import { FunctionComponent, useMemo } from 'react';
import { Field } from 'react-final-form';
import { OfferingUserState } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { Select } from '@/form/select';
import { SelectField } from '@/form/select/SelectField';
import { translate } from '@/i18n';
import { OfferingAutocomplete } from '@/marketplace/offerings/details/OfferingAutocomplete';
import { ProviderAutocomplete } from '@/marketplace/orders/ProviderAutocomplete';
import { TableFilterItem } from '@/table/TableFilterItem';
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

const OfferingUserStateFilter = () => (
  <Field
    name="state"
    render={(fieldProps) => (
      <Select
        placeholder={translate('Select state...')}
        options={getOfferingUserStateFilterOptions()}
        value={fieldProps.input.value}
        onChange={(value) => fieldProps.input.onChange(value)}
        isClearable={true}
        variant="tableFilter"
        isMulti
      />
    )}
  />
);

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
      <TableFilterItem
        title={translate('Offering')}
        name="offering"
        badgeValue={(value) => value?.name}
      >
        <OfferingAutocomplete
          offeringFilter={offeringFilter}
          reactSelectProps={{ variant: 'tableFilter' }}
        />
      </TableFilterItem>
      <TableFilterItem
        title={translate('State')}
        name="state"
        instantApply={false}
      >
        <OfferingUserStateFilter />
      </TableFilterItem>

      {hasOrganizationColumn && (
        <TableFilterItem
          title={translate('Service provider')}
          name="provider"
          getValueLabel={(option) => option.customer_name}
        >
          <ProviderAutocomplete reactSelectProps={{ variant: 'tableFilter' }} />
        </TableFilterItem>
      )}
      {ENV.plugins.WALDUR_CORE.ENFORCE_OFFERING_USER_PROFILE_COMPLETENESS && (
        <TableFilterItem
          title={translate('Profile status')}
          name="has_complete_profile"
          getValueLabel={(value) =>
            profileCompletenessOptions.find((op) => op.value === value)?.label
          }
          instantApply={false}
        >
          <Field
            name="has_complete_profile"
            render={(fieldProps) => (
              <SelectField
                {...fieldProps}
                placeholder={translate('Select status')}
                options={profileCompletenessOptions}
                noUpdateOnBlur={true}
                simpleValue={true}
                isClearable={true}
                variant="tableFilter"
              />
            )}
          />
        </TableFilterItem>
      )}
    </>
  );
};
