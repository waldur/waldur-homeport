import { FunctionComponent } from 'react';
import { Row } from 'react-bootstrap';
import { reduxForm } from 'redux-form';

import { OfferingAutocomplete } from '@waldur/marketplace/offerings/details/OfferingAutocomplete';
import { ProviderAutocomplete } from '@waldur/marketplace/orders/ProviderAutocomplete';

const offeringProps = {
  offeringFilter: {
    billable: true,
  },
};

const PurePlanUsageFilter: FunctionComponent = () => (
  <Row>
    <ProviderAutocomplete className="col-sm-6" />
    <OfferingAutocomplete {...offeringProps} className="col-sm-6" />
  </Row>
);

const enhance = reduxForm({ form: 'PlanUsageFilter' });

export const PlanUsageFilter = enhance(PurePlanUsageFilter);
