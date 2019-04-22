import * as React from 'react';
import * as Row from 'react-bootstrap/lib/Row';
import { reduxForm } from 'redux-form';

import { OfferingAutocomplete } from '@waldur/marketplace/offerings/details/OfferingAutocomplete';
import { ProviderAutocomplete } from '@waldur/marketplace/orders/ProviderAutocomplete';

const PurePlanUsageFilter = () => (
  <Row>
    <ProviderAutocomplete className="col-sm-6"/>
    <OfferingAutocomplete className="col-sm-6"/>
  </Row>
);

const enhance = reduxForm({form: 'PlanUsageFilter'});

export const PlanUsageFilter = enhance(PurePlanUsageFilter);
