import React, { FunctionComponent } from 'react';
import { Row } from 'react-bootstrap';
import { reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import {
  OfferingStateFilter,
  getStates,
} from '@waldur/marketplace/offerings/OfferingStateFilter';
import { OrganizationAutocomplete } from '@waldur/marketplace/orders/OrganizationAutocomplete';

import { SUPPORT_OFFERINGS_FILTER_FORM_ID } from './constants';

const PureSupportOfferingsFilter: FunctionComponent = () => (
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

export const SupportOfferingsFilter = enhance(PureSupportOfferingsFilter);
