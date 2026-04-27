import { formValues } from 'redux-form';

import { FormField } from '@/form/types';
import { getDefaultAllocationPool } from '@/openstack/openstack-network/utils';

const enhance = formValues<any, any, FormField>('attributes.subnet_cidr');

export const OpenStackAllocationPool = enhance((props) => {
  const subnetCidr = props['attributes.subnet_cidr'] || '';
  const { start, end } = getDefaultAllocationPool(subnetCidr);
  return (
    <div className="form-control-static">
      {start && end ? `${start} - ${end}` : '-'}
    </div>
  );
});
