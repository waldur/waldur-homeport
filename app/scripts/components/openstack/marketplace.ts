import { registerOfferingType } from '@waldur/marketplace/common/registry';
import { OpenStackPackageForm, DEFAULT_SUBNET_CIDR } from '@waldur/openstack/OpenStackPackageForm';

const serializer = props => ({
  ...props,
  subnet_cidr: DEFAULT_SUBNET_CIDR.replace('X', props.subnet_cidr),
});

registerOfferingType({
  type: 'Packages.Template',
  component: OpenStackPackageForm,
  serializer,
});
