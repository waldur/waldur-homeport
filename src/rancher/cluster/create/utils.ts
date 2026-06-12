import { useQuery } from '@tanstack/react-query';
import {
  marketplacePublicOfferingsRetrieve,
  Offering,
  OpenStackFlavor,
  OpenStackSubNet,
  openstackFlavorsList,
  openstackSecurityGroupsList,
  openstackSubnetsList,
  openstackVolumeTypesList,
  PublicOfferingDetails,
  RancherCluster,
  rancherClusterTemplatesList,
} from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@/core/api';
import { UI_STALE_TIME } from '@/core/constants';
import { translate } from '@/i18n';
import { useOrderFormData } from '@/marketplace/deploy/selectors';
import {
  formatVolumeTypeChoices,
  getDefaultVolumeType,
} from '@/openstack/openstack-instance/utils';
import { NodeField } from '@/rancher/types';
import { formatFlavor } from '@/resource/utils';

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
  offering: PublicOfferingDetails | Offering,
) => {
  return getAllPages((page) =>
    openstackFlavorsList({
      query: {
        page,
        tenant_uuid,
        name_iregex: offering.plugin_options?.flavors_regex,
      },
    }),
  ).then((data) => data.map(formatFlavorOption));
};

export const formatSubnets = (tenant_uuid: string) =>
  getAllPages((page) =>
    openstackSubnetsList({ query: { page, tenant_uuid } }),
  ).then((data) => data.map(formatSubnetOption));

export const loadNodeCreateData = async (cluster: RancherCluster) => {
  const offering = await marketplacePublicOfferingsRetrieve({
    path: { uuid: cluster.marketplace_offering_uuid },
  }).then((response) => response.data);
  const flavors = await filterFlavors(cluster.tenant_uuid, offering);
  const subnets = await formatSubnets(cluster.tenant_uuid);
  const volumeTypes = await getAllPages((page) =>
    openstackVolumeTypesList({
      query: { page, tenant_uuid: cluster.tenant_uuid },
    }),
  );
  const templates = await getAllPages((page) =>
    rancherClusterTemplatesList({ query: { page, page_size: MAX_PAGE_SIZE } }),
  );
  const volumeTypeChoices = formatVolumeTypeChoices(volumeTypes);
  const defaultVolumeType = getDefaultVolumeType(volumeTypeChoices);
  const securityGroups = await getAllPages((page) =>
    openstackSecurityGroupsList({
      query: { page, tenant_uuid: cluster.tenant_uuid },
    }),
  );
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
        ? await getAllPages((page) =>
            openstackVolumeTypesList({
              query: { page, tenant: tenant.url },
            }),
          )
        : [];
      const volumeTypeChoices = formatVolumeTypeChoices(volumeTypes);
      const defaultVolumeType = getDefaultVolumeType(volumeTypeChoices);
      return {
        volumeTypeChoices,
        defaultVolumeType,
      };
    },

    staleTime: UI_STALE_TIME,
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

export const useFormTenant = () => {
  const { attributes = {} } = useOrderFormData();
  return attributes.tenant;
};

export const useFormNodes = (): NodeField[] => {
  const { attributes = {} } = useOrderFormData();
  return attributes.nodes || [];
};
