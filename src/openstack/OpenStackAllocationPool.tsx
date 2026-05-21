import { useOrderFormData } from '@/marketplace/deploy/selectors';
import { getDefaultAllocationPool } from '@/openstack/openstack-network/utils';

export const OpenStackAllocationPool = () => {
  const formData = useOrderFormData();
  const subnetCidr = formData?.attributes?.subnet_cidr || '';
  const { start, end } = getDefaultAllocationPool(subnetCidr);
  return (
    <div className="form-control-static">
      {start && end ? `${start} - ${end}` : '-'}
    </div>
  );
};
