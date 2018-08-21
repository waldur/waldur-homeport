import * as React from 'react';
import { reduxForm } from 'redux-form';

import { getFormComponent } from '@waldur/marketplace/common/registry';
import { Offering } from '@waldur/marketplace/types';

const PureOfferingConfigurator = props => {
  const FormComponent = getFormComponent(props.offering.offering_type);
  return <FormComponent/>;
};

const enhance = reduxForm<{}, {offering: Offering}>(
  {form: 'marketplaceOffering'}
);

export const OfferingConfigurator = enhance(PureOfferingConfigurator);
