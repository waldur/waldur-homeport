import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Field, InjectedFormProps, reduxForm } from 'redux-form';
import { OfferingUserState } from 'waldur-js-client';

import {
  REACT_MULTI_SELECT_TABLE_FILTER,
  REACT_SELECT_TABLE_FILTER,
  Select,
} from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { OfferingAutocomplete } from '@waldur/marketplace/offerings/details/OfferingAutocomplete';
import { ProviderAutocomplete } from '@waldur/marketplace/orders/ProviderAutocomplete';
import { TableFilterItem } from '@waldur/table/TableFilterItem';
import { getCustomer } from '@waldur/workspace/selectors';

import { PROVIDER_OFFERING_USERS_FORM_ID } from '../constants';

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

const OfferingUserStateFilter = () => (
  <Field
    name="state"
    component={(fieldProps) => (
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

const PureProviderOfferingUsersFilter: FunctionComponent<
  ProviderOfferingUsersFilterProps &
    InjectedFormProps<{}, ProviderOfferingUsersFilterProps>
> = ({ hasOrganizationColumn }) => {
  const customer = useSelector(getCustomer);
  const offeringFilter = useMemo(
    () => ({
      customer_uuid: hasOrganizationColumn ? undefined : customer?.uuid,
      billable: true,
      shared: true,
      state: undefined,
    }),
    [customer],
  );

  return (
    <>
      <TableFilterItem
        title={translate('Offering')}
        name="offering"
        badgeValue={(value) => value.name}
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
    </>
  );
};

const enhance = reduxForm<{}, ProviderOfferingUsersFilterProps>({
  form: PROVIDER_OFFERING_USERS_FORM_ID,
  destroyOnUnmount: false,
})(PureProviderOfferingUsersFilter);

export const ProviderOfferingUsersFilter = enhance;
