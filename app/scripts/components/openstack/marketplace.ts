import { translate } from '@waldur/i18n';
import { registerOfferingType } from '@waldur/marketplace/common/registry';
import { OpenStackPackageForm, DEFAULT_SUBNET_CIDR } from '@waldur/openstack/OpenStackPackageForm';

const serializer = props => ({
  ...props,
  subnet_cidr: DEFAULT_SUBNET_CIDR.replace('X', props.subnet_cidr),
});

const components = [
  {
    type: 'vcpu',
    label: 'vCPU',
    units: 'cores',
  },
  {
    type: 'ram',
    label: 'RAM',
    units: 'GB',
  },
  {
    type: 'storage',
    label: 'Storage',
    units: 'GB',
  },
];

registerOfferingType({
  type: 'Packages.Template',
  get label() {
    return translate('OpenStack package');
  },
  component: OpenStackPackageForm,
  serializer,
  components,
});
