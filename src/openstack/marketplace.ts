import { translate } from '@waldur/i18n';
import { registerOfferingType } from '@waldur/marketplace/common/registry';
import { Attribute } from '@waldur/marketplace/types';
import { OpenStackPackageDetails } from '@waldur/openstack/OpenStackPackageDetails';
import { OpenStackPackageForm, DEFAULT_SUBNET_CIDR } from '@waldur/openstack/OpenStackPackageForm';

const serializer = props => ({
  ...props,
  subnet_cidr: DEFAULT_SUBNET_CIDR.replace('X', props.subnet_cidr),
});

const ServiceSettingsAttributes = (): Attribute[] => [
  {
    key: 'backend_url',
    title: translate('API URL'),
    type: 'string',
  },
  {
    key: 'username',
    title: translate('Username'),
    type: 'string',
  },
  {
    key: 'password',
    title: translate('Password'),
    type: 'password',
  },
  {
    key: 'tenant_name',
    title: translate('Tenant name'),
    type: 'string',
  },
  {
    key: 'external_network_id',
    title: translate('External network ID'),
    type: 'string',
  },
  {
    key: 'availability_zone',
    title: translate('Availability zone'),
    type: 'string',
  },
];

registerOfferingType({
  type: 'Packages.Template',
  get label() {
    return translate('OpenStack package');
  },
  component: OpenStackPackageForm,
  detailsComponent: OpenStackPackageDetails,
  serializer,
  providerType: 'OpenStack',
  attributes: ServiceSettingsAttributes,
});
