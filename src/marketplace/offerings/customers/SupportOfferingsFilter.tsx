import * as React from 'react';
import * as Row from 'react-bootstrap/lib/Row';
import { reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import { SUPPORT_OFFERINGS_FILTER_FORM_ID } from '@waldur/marketplace/offerings/customers/constants';
import {
  OfferingStateFilter,
  getStates,
} from '@waldur/marketplace/offerings/OfferingStateFilter';
import { OrganizationAutocomplete } from '@waldur/marketplace/orders/OrganizationAutocomplete';

const PureSupportOfferingsFilter = () => (
  <Row>
    <OfferingStateFilter />
    <OrganizationAutocomplete
      label={translate('Service provider')}
      placeholder={translate('Select service provider...')}
      noOptionsMessage={translate('No service providers')}
      isServiceProvider={true}
    />
  </Row>
);

const enhance = reduxForm({
  form: SUPPORT_OFFERINGS_FILTER_FORM_ID,
  initialValues: {
    state: [getStates()[0], getStates()[1]],
  },
});

export const SupportOfferingsFilter = enhance(
  PureSupportOfferingsFilter,
) as React.ComponentType<{}>;
