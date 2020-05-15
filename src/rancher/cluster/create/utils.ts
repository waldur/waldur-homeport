import { ENV } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { getFlavors, getSubnets, getVolumeTypes } from '@waldur/openstack/api';
import { Flavor, Subnet } from '@waldur/openstack/openstack-instance/types';
import {
  formatVolumeTypeChoices,
  getDefaultVolumeType,
} from '@waldur/openstack/openstack-instance/utils';
import { formatFlavor } from '@waldur/resource/utils';

const CLUSTER_NAME_PATTERN = new RegExp('^[a-z0-9]([-a-z0-9])+[a-z0-9]$');

export const rancherClusterName = (value: string) =>
  !value.match(CLUSTER_NAME_PATTERN)
    ? translate('Name must consist of lower case alphanumeric characters.')
    : undefined;

const formatSubnetOption = (subnet: Subnet) => ({
  label: `${subnet.network_name} / ${subnet.name} (${subnet.cidr})`,
  value: subnet.url,
});

const formatFlavorOption = (flavor: Flavor) => ({
  ...flavor,
  label: `${flavor.name} (${formatFlavor(flavor)})`,
  value: flavor.url,
});

const getMountPointChoices = () => {
  const mountPoints = ENV.plugins.WALDUR_RANCHER.MOUNT_POINT_CHOICES;
  return mountPoints.map(choice => ({
    label: choice,
    value: choice,
  }));
};

export const loadData = async settings => {
  const params = { settings };
  const flavors = await getFlavors(params);
  const subnets = await getSubnets(params);
  const volumeTypes = await getVolumeTypes(params);
  const volumeTypeChoices = formatVolumeTypeChoices(volumeTypes);
  const defaultVolumeType = getDefaultVolumeType(volumeTypeChoices);
  return {
    subnets: subnets.map(formatSubnetOption),
    flavors: flavors.map(formatFlavorOption),
    volumeTypes: volumeTypeChoices,
    defaultVolumeType: defaultVolumeType && defaultVolumeType.url,
    mountPoints: getMountPointChoices(),
  };
};

export const getDataVolumes = (nodeIndex, allValues) => {
  if (nodeIndex !== undefined) {
    const nodes = allValues.attributes.nodes;
    if (nodeIndex >= nodes.length) {
      return [];
    }
    return nodes[nodeIndex].data_volumes || [];
  } else {
    return allValues.data_volumes || [];
  }
};
