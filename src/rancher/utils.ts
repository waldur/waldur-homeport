import { translate } from '@waldur/i18n';
import { Flavor, Subnet } from '@waldur/openstack/openstack-instance/types';
import { formatFlavor } from '@waldur/resource/utils';

const CLUSTER_NAME_PATTERN = new RegExp('^[a-z0-9]([-a-z0-9])+[a-z0-9]$');

export const rancherClusterName = (value: string) =>
  // tslint:disable-next-line:max-line-length
  !value.match(CLUSTER_NAME_PATTERN) ? translate('Name must consist of lower case alphanumeric characters.') :
  undefined ;

export const formatSubnetOption = (subnet: Subnet) => ({
  label: `${subnet.network_name} / ${subnet.name} (${subnet.cidr})`,
  value: subnet.url,
});

export const formatFlavorOption = (flavor: Flavor) => ({
  ...flavor,
  label: `${flavor.name} (${formatFlavor(flavor)})`,
  value: flavor.url,
});
