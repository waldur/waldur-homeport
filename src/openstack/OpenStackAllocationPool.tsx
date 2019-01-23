import * as React from 'react';
import { formValues } from 'redux-form';

import { FormField } from '@waldur/form-react/types';

import { extractSubnet } from './utils';

interface OpenStackAllocationPoolProps extends FormField {
  range: string;
}

const enhance = formValues<any, any, OpenStackAllocationPoolProps>('attributes.subnet_cidr');

export const OpenStackAllocationPool = enhance(props => {
  let subnetCidr = props['attributes.subnet_cidr'];
  if (isNaN(subnetCidr)) {
    subnetCidr = extractSubnet(subnetCidr);
  }
  return (
    <div className="form-control-static">
      {subnetCidr ? props.range.replace(/X/g, subnetCidr) : '-'}
    </div>
  );
});
