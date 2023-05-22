import { FunctionComponent } from 'react';
import { reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import { OfferingTypeAutocomplete } from '@waldur/marketplace/offerings/details/OfferingTypeAutocomplete';
import {
  OfferingStateFilter,
  getStates,
} from '@waldur/marketplace/offerings/OfferingStateFilter';
import { OrganizationAutocomplete } from '@waldur/marketplace/orders/OrganizationAutocomplete';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

import { ADMIN_OFFERINGS_FILTER_FORM_ID } from './constants';

const PureAdminOfferingsFilter: FunctionComponent = () => (
  <>
    <TableFilterItem title={translate('State')} name="state">
      <OfferingStateFilter />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Organization')}
      name="organization"
      badgeValue={(value) => value?.name}
    >
      <OrganizationAutocomplete />
    </TableFilterItem>
    <TableFilterItem title={translate('Integration type')} name="type">
      <OfferingTypeAutocomplete />
    </TableFilterItem>
  </>
);

const enhance = reduxForm({
  form: ADMIN_OFFERINGS_FILTER_FORM_ID,
  initialValues: {
    state: [getStates()[0], getStates()[1]],
  },
  destroyOnUnmount: false,
});

export const AdminOfferingsFilter = enhance(PureAdminOfferingsFilter);
