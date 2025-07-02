import { useQuery } from '@tanstack/react-query';
import {
  marketplacePublicOfferingsRetrieve,
  OpenStackFlavor,
  OpenStackSubNet,
  PublicOfferingDetails,
  RancherCluster,
  rancherClusterTemplatesList,
} from 'waldur-js-client';

import { getAllPages } from '@waldur/core/api';
import { translate } from '@waldur/i18n';
import { orderFormSelector } from '@waldur/marketplace/deploy/selectors';
import {
  loadFlavors,
  loadSecurityGroups,
  loadSubnets,
  loadVolumeTypes,
} from '@waldur/openstack/api';
import {
  formatVolumeTypeChoices,
  getDefaultVolumeType,
} from '@waldur/openstack/openstack-instance/utils';
import { NodeField } from '@waldur/rancher/types';
import { formatFlavor } from '@waldur/resource/utils';
import { type RootState } from '@waldur/store/reducers';

const CLUSTER_NAME_PATTERN = new RegExp('^[a-z0-9]([-a-z0-9])+[a-z0-9]$');

export const rancherClusterName = (value: string) =>
  !value.match(CLUSTER_NAME_PATTERN)
    ? translate('Name must consist of lower case alphanumeric characters.')
    : undefined;

const formatSubnetOption = (subnet: OpenStackSubNet) => ({
  label: `${subnet.network_name} / ${subnet.name} (${subnet.cidr})`,
  value: subnet.url,
});

const formatFlavorOption = (flavor: OpenStackFlavor) => ({
  ...flavor,
  label: `${flavor.name} (${formatFlavor(flavor)})`,
  value: flavor.url,
});

export const filterFlavors = (
  tenant_uuid: string,
  offering: PublicOfferingDetails,
) => {
  return loadFlavors({
    tenant_uuid,
    name_iregex: offering.plugin_options.flavors_regex,
  }).then((data) => data.map(formatFlavorOption));
};

export const formatSubnets = (tenant_uuid: string) =>
  loadSubnets({ tenant_uuid }).then((data) => data.map(formatSubnetOption));

export const loadNodeCreateData = async (cluster: RancherCluster) => {
  const offering = await marketplacePublicOfferingsRetrieve({
    path: { uuid: cluster.marketplace_offering_uuid },
  }).then((response) => response.data);
  const flavors = await filterFlavors(cluster.tenant_uuid, offering);
  const subnets = await formatSubnets(cluster.tenant_uuid);
  const volumeTypes = await loadVolumeTypes({
    tenant_uuid: cluster.tenant_uuid,
  });
  const templates = await getAllPages((page) =>
    rancherClusterTemplatesList({ query: { page } }),
  );
  const volumeTypeChoices = formatVolumeTypeChoices(volumeTypes);
  const defaultVolumeType = getDefaultVolumeType(volumeTypeChoices);
  const securityGroups = await loadSecurityGroups({
    tenant_uuid: cluster.tenant_uuid,
  });
  return {
    subnets,
    flavors,
    volumeTypes: volumeTypeChoices,
    defaultVolumeType: defaultVolumeType && defaultVolumeType.value,
    templates,
    securityGroups,
  };
};

export const useVolumeDataLoader = (tenant) => {
  return useQuery({
    queryKey: ['volumeTypes', tenant],

    queryFn: async () => {
      const volumeTypes = tenant
        ? await loadVolumeTypes({ tenant: tenant.url })
        : [];
      const volumeTypeChoices = formatVolumeTypeChoices(volumeTypes);
      const defaultVolumeType = getDefaultVolumeType(volumeTypeChoices);
      return {
        volumeTypeChoices,
        defaultVolumeType,
      };
    },

    staleTime: 3 * 60 * 1000,
  });
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

export const formTenantSelector = (state: RootState) =>
  orderFormSelector(state, 'attributes.tenant');

export const formNodesSelector = (state: RootState): NodeField[] =>
  orderFormSelector(state, 'attributes.nodes');
