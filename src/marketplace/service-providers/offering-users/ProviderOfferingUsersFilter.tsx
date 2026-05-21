import { FunctionComponent, useMemo } from 'react';
import { Field } from 'react-final-form';
import { useSelector } from 'react-redux';
import { OfferingUserState } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { SelectField } from '@/form/SelectField';
import {
  REACT_MULTI_SELECT_TABLE_FILTER,
  REACT_SELECT_TABLE_FILTER,
  Select,
} from '@/form/themed-select';
import { translate } from '@/i18n';
import { OfferingAutocomplete } from '@/marketplace/offerings/details/OfferingAutocomplete';
import { ProviderAutocomplete } from '@/marketplace/orders/ProviderAutocomplete';
import { TableFilterItem } from '@/table/TableFilterItem';
import { getCustomer } from '@/workspace/selectors';

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
        {...REACT_MULTI_SELECT_TABLE_FILTER}
      />
    )}
  />
);

export const ProviderOfferingUsersFilter: FunctionComponent<
  ProviderOfferingUsersFilterProps
> = ({ hasOrganizationColumn }) => {
  const customer = useSelector(getCustomer);
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
          reactSelectProps={REACT_SELECT_TABLE_FILTER}
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
          <ProviderAutocomplete reactSelectProps={REACT_SELECT_TABLE_FILTER} />
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
                {...REACT_SELECT_TABLE_FILTER}
              />
            )}
          />
        </TableFilterItem>
      )}
    </>
  );
};
