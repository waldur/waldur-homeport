import * as React from 'react';
import { formValues } from 'redux-form';

import { FormField } from '@waldur/form-react/types';

interface OpenStackAllocationPoolProps extends FormField {
  range: string;
}

const enhance = formValues<any, any, OpenStackAllocationPoolProps>('attributes.subnet_cidr');

export const OpenStackAllocationPool = enhance(props => (
  <div className="form-control-static">
    {props['attributes.subnet_cidr'] ? props.range.replace(/X/g, props['attributes.subnet_cidr']) : '-'}
  </div>
));
