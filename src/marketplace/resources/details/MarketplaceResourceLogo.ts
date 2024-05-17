import openstackIcon from '@waldur/images/appstore/icon-openstack.png';
import {
  INSTANCE_TYPE,
  TENANT_TYPE,
  VOLUME_TYPE,
} from '@waldur/openstack/constants';

export const getMarketplaceResourceLogo = (resource) =>
  [INSTANCE_TYPE, TENANT_TYPE, VOLUME_TYPE].includes(resource.offering_type)
    ? openstackIcon
    : resource.offering_thumbnail || resource.category_icon;
