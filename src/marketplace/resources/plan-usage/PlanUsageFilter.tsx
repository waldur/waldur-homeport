import * as React from 'react';
import * as Row from 'react-bootstrap/lib/Row';
import { reduxForm } from 'redux-form';

import { OfferingAutocomplete } from '@waldur/marketplace/offerings/details/OfferingAutocomplete';
import { ProviderAutocomplete } from '@waldur/marketplace/orders/ProviderAutocomplete';

const offeringProps = {
  offeringFilter: {
    billable: true,
  },
};

const PurePlanUsageFilter = () => (
  <Row>
    <ProviderAutocomplete className="col-sm-6" />
    <OfferingAutocomplete {...offeringProps} className="col-sm-6" />
  </Row>
);

const enhance = reduxForm({ form: 'PlanUsageFilter' });

export const PlanUsageFilter = enhance(PurePlanUsageFilter);
