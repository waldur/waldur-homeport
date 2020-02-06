import { getAll } from '@waldur/core/api';
import { Flavor, Subnet } from '@waldur/openstack/openstack-instance/types';
import { VolumeType } from '@waldur/openstack/types';

export const getFlavors = params => getAll<Flavor>('/openstacktenant-flavors/', {params});

export const getSubnets = params => getAll<Subnet>('/openstacktenant-subnets/', {params});

export const getVolumeTypes = params => getAll<VolumeType>('/openstacktenant-volume-types/', {params});
