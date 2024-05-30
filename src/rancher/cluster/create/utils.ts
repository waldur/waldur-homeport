import { useQuery } from '@tanstack/react-query';
import { formValueSelector } from 'redux-form';

import { ENV } from '@waldur/configs/default';
import { getUUID } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { ORDER_FORM_ID } from '@waldur/marketplace/details/constants';
import { Offering } from '@waldur/marketplace/types';
import {
  getFlavors,
  getSubnets,
  getVolumeTypes,
  loadSecurityGroups,
} from '@waldur/openstack/api';
import { Flavor, Subnet } from '@waldur/openstack/openstack-instance/types';
import {
  formatVolumeTypeChoices,
  getDefaultVolumeType,
} from '@waldur/openstack/openstack-instance/utils';
import { listClusterTemplates } from '@waldur/rancher/api';
import { NodeField } from '@waldur/rancher/types';
import { formatFlavor } from '@waldur/resource/utils';
import { RootState } from '@waldur/store/reducers';

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

export const loadFlavors = (settings: string, offering: Offering) => {
  const params = { settings };
  return getFlavors({
    ...params,
    name_iregex: offering.plugin_options?.flavors_regex,
  }).then((data) => data.map(formatFlavorOption));
};

export const loadSubnets = (settings: string) =>
  getSubnets({ settings }).then((data) => data.map(formatSubnetOption));

export const getRancherMountPointChoices = () => {
  const mountPoints = ENV.plugins.WALDUR_RANCHER.MOUNT_POINT_CHOICES;
  return mountPoints.map((choice) => ({
    label: choice,
    value: choice,
  }));
};

export const loadData = async (settings: string, offering: Offering) => {
  const params = { settings };
  const flavors = await loadFlavors(settings, offering);
  const subnets = await loadSubnets(settings);
  const volumeTypes = await getVolumeTypes(params);
  const templates = await listClusterTemplates();
  const volumeTypeChoices = formatVolumeTypeChoices(volumeTypes);
  const defaultVolumeType = getDefaultVolumeType(volumeTypeChoices);
  const securityGroups = await loadSecurityGroups(getUUID(settings));
  return {
    subnets,
    flavors,
    volumeTypes: volumeTypeChoices,
    defaultVolumeType: defaultVolumeType && defaultVolumeType.value,
    mountPoints: getRancherMountPointChoices(),
    templates,
    securityGroups,
  };
};

export const useVolumeDataLoader = (settings: string) => {
  return useQuery(
    ['volumeTypes', settings],
    async () => {
      const volumeTypes = settings ? await getVolumeTypes({ settings }) : [];
      const volumeTypeChoices = formatVolumeTypeChoices(volumeTypes);
      const defaultVolumeType = getDefaultVolumeType(volumeTypeChoices);
      return {
        volumeTypeChoices,
        defaultVolumeType,
      };
    },
    { staleTime: 3 * 60 * 1000 },
  );
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

export const formTenantSelector = (state: RootState): string =>
  formValueSelector(ORDER_FORM_ID)(state, 'attributes.tenant_settings');

export const formNodesSelector = (state: RootState): NodeField[] =>
  formValueSelector(ORDER_FORM_ID)(state, 'attributes.nodes');
