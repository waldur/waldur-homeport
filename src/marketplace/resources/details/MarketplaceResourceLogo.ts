import {
  INSTANCE_TYPE,
  TENANT_TYPE,
  VOLUME_TYPE,
} from '@waldur/openstack/constants';

const openstackIcon = require('@waldur/images/appstore/icon-openstack.png');

export const getMarketplaceResourceLogo = (resource) =>
  [INSTANCE_TYPE, TENANT_TYPE, VOLUME_TYPE].includes(resource.offering_type)
    ? openstackIcon
    : resource.offering_thumbnail || resource.category_icon;
