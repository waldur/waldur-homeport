import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { reduxForm } from 'redux-form';

import { REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { OfferingAutocomplete } from '@waldur/marketplace/offerings/details/OfferingAutocomplete';
import { TableFilterItem } from '@waldur/table/TableFilterItem';
import { getCustomer } from '@waldur/workspace/selectors';

import { PROVIDER_OFFERING_USERS_FORM_ID } from './constants';

const PureProviderOfferingUsersFilter: FunctionComponent<{}> = () => {
  const customer = useSelector(getCustomer);
  const offeringFilter = useMemo(
    () => ({
      customer_uuid: customer.uuid,
      billable: true,
      shared: true,
      state: undefined,
    }),
    [customer],
  );

  return (
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
  );
};

const enhance = reduxForm<{ offering }>({
  form: PROVIDER_OFFERING_USERS_FORM_ID,
  destroyOnUnmount: false,
});

export const ProviderOfferingUsersFilter = enhance(
  PureProviderOfferingUsersFilter,
);
