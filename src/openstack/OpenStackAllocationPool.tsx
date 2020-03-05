import * as React from 'react';
import { formValues } from 'redux-form';

import { FormField } from '@waldur/form-react/types';

const enhance = formValues<any, any, FormField>('attributes.subnet_cidr');

export const OpenStackAllocationPool = enhance(props => {
  const subnetCidr = props['attributes.subnet_cidr'] || '';
  const prefix = subnetCidr
    .split('.')
    .slice(0, 3)
    .join('.');
  return (
    <div className="form-control-static">
      {prefix ? `${prefix}.10 - ${prefix}.200` : '-'}
    </div>
  );
});
