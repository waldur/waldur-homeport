import * as React from 'react';
import { reduxForm } from 'redux-form';

import { getFormComponent } from '@waldur/marketplace/common/registry';
import { Product } from '@waldur/marketplace/types';

const PureProductConfigurator = props => {
  const FormComponent = getFormComponent(props.product.offering_type);
  return <FormComponent/>;
};

const enhance = reduxForm<{}, {product: Product}>(
  {form: 'marketplaceProduct'}
);

export const ProductConfigurator = enhance(PureProductConfigurator);
