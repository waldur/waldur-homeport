import openstackIcon from '@/images/appstore/icon-openstack.png';
import { INSTANCE_TYPE, TENANT_TYPE, VOLUME_TYPE } from '@/openstack/constants';

export const getMarketplaceResourceLogo = (resource) =>
  [INSTANCE_TYPE, TENANT_TYPE, VOLUME_TYPE].includes(resource.offering_type)
    ? openstackIcon
    : resource.offering_thumbnail || resource.category_icon;
