import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import { OfferingAutocomplete } from '@waldur/marketplace/offerings/details/OfferingAutocomplete';
import { TableFilterFormContainer } from '@waldur/table/TableFilterFormContainer';
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
    <TableFilterFormContainer form={PROVIDER_OFFERING_USERS_FORM_ID}>
      <TableFilterItem
        title={translate('Offering')}
        name="offering"
        badgeValue={(value) => value.name}
      >
        <OfferingAutocomplete offeringFilter={offeringFilter} />
      </TableFilterItem>
    </TableFilterFormContainer>
  );
};

const enhance = reduxForm<{ offering }>({
  form: PROVIDER_OFFERING_USERS_FORM_ID,
  destroyOnUnmount: false,
});

export const ProviderOfferingUsersFilter = enhance(
  PureProviderOfferingUsersFilter,
);
