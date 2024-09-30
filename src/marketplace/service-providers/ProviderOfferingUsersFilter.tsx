import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { InjectedFormProps, reduxForm } from 'redux-form';

import { REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { OfferingAutocomplete } from '@waldur/marketplace/offerings/details/OfferingAutocomplete';
import { TableFilterItem } from '@waldur/table/TableFilterItem';
import { getCustomer } from '@waldur/workspace/selectors';

import { ProviderAutocomplete } from '../orders/ProviderAutocomplete';

import { PROVIDER_OFFERING_USERS_FORM_ID } from './constants';

interface ProviderOfferingUsersFilterProps {
  hasOrganizationColumn?: boolean;
}

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
