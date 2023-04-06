import { FunctionComponent } from 'react';
import { reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import {
  OfferingStateFilter,
  getStates,
} from '@waldur/marketplace/offerings/OfferingStateFilter';
import { OrganizationAutocomplete } from '@waldur/marketplace/orders/OrganizationAutocomplete';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

import { SUPPORT_OFFERINGS_FILTER_FORM_ID } from './constants';

const PureSupportOfferingsFilter: FunctionComponent = () => (
  <>
    <TableFilterItem title={translate('State')} name="state">
      <OfferingStateFilter />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Service provider')}
      name="organization"
      badgeValue={(value) => value?.name}
    >
      <OrganizationAutocomplete
        placeholder={translate('Select service provider...')}
        noOptionsMessage={translate('No service providers')}
        isServiceProvider={true}
      />
    </TableFilterItem>
  </>
);

const enhance = reduxForm({
  form: SUPPORT_OFFERINGS_FILTER_FORM_ID,
  initialValues: {
    state: [getStates()[0], getStates()[1]],
  },
  destroyOnUnmount: false,
});

export const SupportOfferingsFilter = enhance(PureSupportOfferingsFilter);
