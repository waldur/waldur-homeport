import * as React from 'react';
import { reduxForm } from 'redux-form';

import { getFormComponent } from '@waldur/marketplace/common/registry';
import { Offering } from '@waldur/marketplace/types';

import { OfferingFormData } from './types';

interface PureOfferingConfiguratorProps {
  offering: Offering;
}

const PureOfferingConfigurator = (props: PureOfferingConfiguratorProps) => {
  const FormComponent = getFormComponent(props.offering.type);
  if (!FormComponent) {
    return null;
  }
  return <FormComponent {...props}/>;
};

const enhance = reduxForm<OfferingFormData, PureOfferingConfiguratorProps>(
  {form: 'marketplaceOffering'}
);

export const OfferingConfigurator = enhance(PureOfferingConfigurator);
